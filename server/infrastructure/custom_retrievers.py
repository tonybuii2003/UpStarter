import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
import logging
from langchain.schema import Document
from langchain.schema.retriever import BaseRetriever

from pydantic import Field, PrivateAttr
import numpy as np
import openai
load_dotenv()
openai_api_key = os.environ["OPEN_AI_API_KEY"]
openai.api_key = openai_api_key
class CustomElasticsearchResumeRetriever(BaseRetriever):
    index_name: str = Field(...)
    top_k: int = Field(default=5)
    _es_client: Elasticsearch = PrivateAttr()
    def __init__(self, es_client: Elasticsearch, index_name:str,  top_k: int = 20):
        super().__init__(index_name=index_name, top_k=top_k)
        self._es_client = es_client
        self.index_name = index_name
        self.top_k = top_k

    def _get_relevant_documents(self, query: str):
        embedding = openai.embeddings.create(input=query, model="text-embedding-3-small").data[0].embedding
        es_query = {
        "_source": {"exclude": ["resume_embedding"]},  # Exclude full vector from results
        "query": {
            "script_score": {
                "query": {"match_all": {}},  # Baseline query (can add filters here)
                "script": {
                    "source": "cosineSimilarity(params.query_vector, 'resume_embedding') + 1.0",
                    "params": {"query_vector": embedding}
                }
            }
        },
        "size": self.top_k
    }

        # Execute the search
        response = self._es_client.search(index=self.index_name, body=es_query)

        # Process and return the results
        documents = []

        for hit in response['hits']['hits']:
            chunk_text = hit['_source']["resume"]
            score = hit['_score']

            documents.append(Document(page_content=chunk_text, metadata={"score": score, "id": hit['_id']}))

        return documents



class CustomElasticsearchStartupRetriever(BaseRetriever):
    index_name: str = Field(...)
    top_k: int = Field(default=5)
    _es_client: Elasticsearch = PrivateAttr()
    def __init__(self, es_client: Elasticsearch, index_name:str,  top_k: int = 20):
        super().__init__(index_name=index_name, top_k=top_k)
        self._es_client = es_client
        self.index_name = index_name
        self.top_k = top_k

    def _get_relevant_documents(self, query: str):
        embedding = openai.embeddings.create(input=query, model="text-embedding-3-small").data[0].embedding
        es_query = {
        "_source": {"exclude": ["about_us_embedding"]},  # Exclude full vector from results
        "query": {
            "script_score": {
                "query": {"match_all": {}},  # Baseline query (can add filters here)
                "script": {
                    "source": "cosineSimilarity(params.query_vector, 'about_us_embedding') + 1.0",
                    "params": {"query_vector": embedding}
                }
            }
        },
        "size": self.top_k
    }

        # Execute the search
        response = self._es_client.search(index=self.index_name, body=es_query)

        # Process and return the results
        documents = []

        for hit in response['hits']['hits']:
            chunk_text = hit['_source']["about_us"]
            score = hit['_score']

            documents.append(Document(page_content=chunk_text, metadata={"score": score, "id": hit['_id']}))

        return documents
    