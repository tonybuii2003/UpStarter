from elasticsearch import Elasticsearch
from dotenv import load_dotenv
import os
from infrastructure.custom_retrievers import CustomElasticsearchResumeRetriever
load_dotenv()

client = Elasticsearch(
  "https://my-elasticsearch-project-b7242c.es.us-central1.gcp.elastic.cloud:443",
  api_key=os.environ["ELASTICSEARCH_API_KEY"]
)

class Elasticsearch_Inf:
    def __init__(self):
        self.client = client
