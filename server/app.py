from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import time
from typing import Dict, Optional
from dotenv import load_dotenv
load_dotenv()
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.runnables import RunnablePassthrough
from langchain.globals import set_llm_cache
from elasticsearch import Elasticsearch, helpers
from langchain_community.vectorstores import ElasticsearchStore
import json
import logging
import random
import os
from infrastructure.supabase_inf import Supabase_Infrastructure
from infrastructure.langchain_infrastructure import LangChain_Inf

set_llm_cache(None)

app = Flask(__name__)

# Enhanced CORS configuration for tunneling
CORS(app, resources={
    r"/*": {
        "origins": ["*"],  # Allow all origins for development
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

# Add headers for tunneling compatibility
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

LANGCHAIN_INF = LangChain_Inf()

class StartupManager:
    def __init__(self):
        self.startups = {
            "ecovision": {
                "id": "ecovision",
                "name": "EcoVision AI",
                "description": "An AI-powered platform that helps businesses reduce their carbon footprint through predictive analytics",
                "founders": [
                    {
                        "name": "Dr. Sarah Chen",
                        "title": "CEO & Co-Founder",
                        "background": "PhD in Environmental Science from Stanford, former lead researcher at ClimateAI, expert in carbon accounting and machine learning applications for sustainability",
                        "skills": ["Machine Learning", "Carbon Accounting", "Team Leadership", "Public Speaking"],
                        "interests": ["Renewable energy", "Sustainable agriculture", "AI ethics"],
                        "fun_fact": "Once cycled across Canada to raise awareness about climate change"
                    },
                    {
                        "name": "Jamal Williams",
                        "title": "CTO & Co-Founder",
                        "background": "MS in Computer Science from MIT, former engineering lead at Tesla's energy division, built scalable systems for energy optimization",
                        "skills": ["Distributed Systems", "Energy Optimization", "Python/Go", "Cloud Architecture"],
                        "interests": ["Clean tech", "Open source software", "Mentoring"],
                        "fun_fact": "Holds three patents for energy storage algorithms"
                    }
                ]
            },
            "agritech": {
                "id": "agritech",
                "name": "AgriTech Solutions",
                "description": "AI-driven solutions for sustainable agriculture",
                "founders": [
                    {
                        "name": "Dr. Raj Patel",
                        "title": "CEO & Founder",
                        "background": "PhD in Agricultural Engineering from UC Davis, former director of research at Monsanto",
                        "skills": ["Precision Agriculture", "IoT Systems", "Data Analysis"],
                        "interests": ["Food security", "Climate resilience", "Robotics"],
                        "fun_fact": "Developed an AI system that predicts crop yields with 95% accuracy"
                    }
                ]
            }
        }

    def get_startup(self, startup_id: str) -> Optional[Dict]:
        return self.startups.get(startup_id)

class FounderQA:
    def __init__(self):
        self.manager = StartupManager()
        self.current_startup = None
        self.llm = ChatOpenAI(temperature=0.3, model="gpt-3.5-turbo", verbose=False)
        self.qa_chain = None
    
    def set_startup(self, startup_id: str) -> bool:
        self.current_startup = self.manager.get_startup(startup_id)
        if self.current_startup:
            self.setup_qa_chain()
            return True
        return False
    
    def setup_qa_chain(self):
        template = """Answer questions about {company_name} founders:
        {founders_info}
        Question: {question}"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        founders_info = "\n\n".join([
            f"Founder {i+1}:\nName: {f['name']}\nTitle: {f['title']}\nBackground: {f['background']}\n"
            f"Skills: {', '.join(f['skills'])}\nInterests: {', '.join(f['interests'])}\n"
            f"Fun Fact: {f['fun_fact']}"
            for i, f in enumerate(self.current_startup["founders"])
        ])
        
        self.qa_chain = (
            {
                "question": RunnablePassthrough(),
                "company_name": lambda x: self.current_startup["name"],
                "founders_info": lambda x: founders_info
            }
            | prompt
            | self.llm
        )
    
    def ask_about_founders(self, question: str) -> str:
        if not self.current_startup:
            raise ValueError("No startup selected")
        return self.qa_chain.invoke({"question": question})

# Initialize the QA system
qa_system = FounderQA()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Flask server is running"})

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"success": 200, "content": "hello"})

@app.route('/load_users_swipe', methods=['GET'])
def load_users_swipe():
    try:
        supabase_inf = Supabase_Infrastructure()
        user_ids = list(range(2000))  # More efficient way to create the list
        random.shuffle(user_ids)
        user_ids = user_ids[:25]  # Get 25 random user IDs
        
        users = []
        for user_id in user_ids:
            try:
                # Add a small delay between requests to avoid overwhelming the server
                time.sleep(0.1)
                user_data = supabase_inf.get_user_by_id(f"{user_id}")
                if user_data:  # Only append if we got valid data
                    users.append(user_data)
            except Exception as e:
                logging.error(f"Error fetching user {user_id}: {str(e)}")
                continue  # Skip this user and continue with the next
        
        if not users:
            return jsonify({"success": False, "error": "No users could be loaded"}), 500
            
        return jsonify({"success": True, "content": users})
        
    except Exception as e:
        logging.error(f"Error in load_users_swipe: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

    return jsonify({"success": 200, "content": users})

@app.route('/agent_workspace', methods=['POST'])
def agent_workspace():
    print(request.json)

    question = request.json.get('question', '')
    print(question)
    response = LANGCHAIN_INF.workspace_agent( question)
    if "<BUSINESS_PLAN>" in response:
        business_plan = response.split("<BUSINESS_PLAN>")[1].split("</BUSINESS_PLAN>")[0]
        return jsonify({"success": True, "content": business_plan, "type": "business_plan"})
    if "<MARKETING_PLAN>" in response:
        marketing_plan = response.split("<MARKETING_PLAN>")[1].split("</MARKETING_PLAN>")[0]
        return jsonify({"success": True, "content": marketing_plan, "type": "marketing_plan"})
    if "<COMPANY_DESCRIPTION>" in response:
        company_description = response.split("<COMPANY_DESCRIPTION>")[1].split("</COMPANY_DESCRIPTION>")[0]
        return jsonify({"success": True, "content": company_description, "type": "company_description"})
    if "<BUSINESS_OPPORTUNITY>" in response:
        business_opportunity = response.split("<BUSINESS_OPPORTUNITY>")[1].split("</BUSINESS_OPPORTUNITY>")[0]
        return jsonify({"success": True, "content": business_opportunity, "type": "business_opportunity"})
    return jsonify({"success": True, "content": response})

@app.route('/agent_user_qa', methods=['POST'])
def agent_user_qa():
    print(request.json)
    user_id = request.json.get('user_id', '')
    question = request.json.get('question', '')
    print(user_id, question)
    response = LANGCHAIN_INF.agent_user_qa(user_id, question)
    print("\n\n\n\nsuccess response\n\n\n\n")
    print(response)
    supabase_inf = Supabase_Infrastructure()
    # response = " Here are the users specialized in AI: <USER_IDS> 546, 1318, 1238, 1186, 1871, 268, 1030, 1485, 79, 486, 1111, 443, 54, 1415, 1645, 1364, 648, 964, 644, 1137 </USER_IDS>"
    if "<USER_IDS>" in response:
        user_ids = response.split("<USER_IDS>")[1].split("</USER_IDS>")[0]
        user_ids = user_ids.replace("[", "")
        user_ids = user_ids.replace("]", "")
        user_ids = user_ids.replace("'", "")
        user_ids = user_ids.split(",")
        user_ids = [int(user_id) for user_id in user_ids]
        print(user_ids)
        users = []
        # use supabase to get the users
        
        for user_id in user_ids:
            user = supabase_inf.get_user_by_id(user_id)
            user["seed"] = random.randint(0, 100)
            users.append(user)
        return jsonify({"success": True, "content": users, "type": "user_ids"})
    
    if "<STARTUP_IDS>" in response:
        startup_ids = response.split("<STARTUP_IDS>")[1].split("</STARTUP_IDS>")[0]
        startup_ids = startup_ids.replace("[", "")
        startup_ids = startup_ids.replace("]", "")
        startup_ids = startup_ids.replace("'", "")
        startup_ids = startup_ids.split(",")
        startup_ids = [int(startup_id) for startup_id in startup_ids]
        print(startup_ids)
        startups = []
        for startup_id in startup_ids:
            startup = supabase_inf.get_startup_by_id(startup_id)
            startups.append(startup)
        return jsonify({"success": True, "content": startups, "type": "startup_ids"})

    return jsonify({"success": True, "content": response, "type": "text"})

@app.route('/get_user_by_id', methods=['POST'])
def get_user_by_id():
    supabase_inf = Supabase_Infrastructure()
    user_id = request.json.get("user_id", '')
    user_data = supabase_inf.get_user_by_id(f"{user_id}")
    print(user_data)
    return jsonify({"success": True, "content": user_data})


@app.route('/ask/<startup_id>', methods=['POST'])
def ask(startup_id):
    try:
        supabase_inf = Supabase_Infrastructure()
        
        # 1. Fetch startup data
        startup_data = supabase_inf.client.table("startup_table") \
            .select("*") \
            .eq("startup_id", startup_id) \
            .execute()
        
        if not startup_data.data:
            return jsonify({"error": "Startup not found"}), 404
            
        startup = startup_data.data[0]
        
        # 2. Parse cofounder IDs (format: "(id1, id2)")
        cofounder_ids = []
        if startup.get('cofounders'):
            try:
                cofounder_ids = [
                    int(id.strip()) 
                    for id in startup['cofounders'][1:-1].split(',')
                    if id.strip().isdigit()
                ]
            except Exception as e:
                logging.error(f"Error parsing cofounders: {str(e)}")
                return jsonify({"error": "Invalid cofounders data"}), 400
        
        # 3. Fetch cofounder details
        founders = []
        for user_id in cofounder_ids:
            try:
                user_data = supabase_inf.client.table("user_table") \
                    .select("*") \
                    .eq("user_id", user_id) \
                    .execute()
                
                if user_data.data:
                    user = user_data.data[0]
                    founders.append({
                        "name": user.get('name', 'Unknown'),
                        "title": "Co-Founder",  # Default title
                        "background": user.get('about_me', ''),
                        "skills": [user.get('major', '')] if user.get('major') else [],
                        "interests": [],  # Can be extended if available
                        "fun_fact": ""  # Can be extended if available
                    })
            except Exception as e:
                logging.error(f"Error fetching cofounder {user_id}: {str(e)}")
                continue
        
        if not founders:
            return jsonify({"error": "No founders found for this startup"}), 404
        
        # 4. Set up QA system
        qa_system.current_startup = {
            "id": str(startup['startup_id']),
            "name": startup['name'],
            "description": startup.get('about_content', ''),
            "founders": founders
        }
        qa_system.setup_qa_chain()
        
        # 5. Process question
        question = request.json.get('question', '')
        if not question:
            return jsonify({"error": "Question is required"}), 400
            
        response = qa_system.ask_about_founders(question)
        return jsonify({
            "answer": response.content,
            "startup": qa_system.current_startup["name"]
        })
        
    except Exception as e:
        logging.error(f"Error in ask endpoint: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/ask_stream/<startup_id>', methods=['POST', 'GET'])
def ask_stream(startup_id):
    try:
        # Validate request
        question = ""
        print(f"Request method: {request.method}")
        # Handle both GET (query param) and POST (JSON body) requests
        if request.method == 'GET':
            question = request.args.get('query', '')
            print(f"Received GET question: {question}")
            # print request
            print(f"Full request args: {request.args}")
        else:
            # For POST, try to get JSON body, but don't require it
            if request.is_json:
                data = request.get_json()
                question = data.get('question', '')
                print(f"Received POST question: {question}")
                print(f"Full request JSON: {data}")
            else:
                # Fallback to form data if not JSON
                print("Request is not JSON, checking form data")
                question = request.form.get('query', '')
        
        if not question:
            return jsonify({"error": "Question is required"}), 400

        # Fetch startup data
        supabase_inf = Supabase_Infrastructure()
        startup_data = supabase_inf.client.table("startup_table") \
            .select("*") \
            .eq("startup_id", startup_id) \
            .execute()
            
        if not startup_data.data:
            return jsonify({"error": "Startup not found"}), 404
            
        startup = startup_data.data[0]
        
        # Parse cofounder IDs from string like "(2, 1482)"
        # 2. Parse cofounder IDs
        cofounder_ids = []
        if startup.get('cofounders'):
            try:
                cofounder_ids = [
                    int(id.strip()) 
                    for id in startup['cofounders'][1:-1].split(',')
                    if id.strip().isdigit()
                ]
            except Exception as e:
                logging.error(f"Error parsing cofounders: {str(e)}")
                return jsonify({"error": "Invalid cofounders data"}), 400
        
        # 3. Fetch cofounder details
        founders = []
        for user_id in cofounder_ids:
            try:
                user_data = supabase_inf.client.table("user_table") \
                    .select("*") \
                    .eq("user_id", user_id) \
                    .execute()
                
                if user_data.data:
                    user = user_data.data[0]
                    founders.append({
                        "name": user.get('name', 'Unknown'),
                        "title": "Co-Founder",
                        "background": user.get('about_me', ''),
                        "skills": [user.get('major', '')] if user.get('major') else [],
                        "interests": [],
                        "fun_fact": ""
                    })
            except Exception as e:
                logging.error(f"Error fetching cofounder {user_id}: {str(e)}")
                continue
        
        if not founders:
            return jsonify({"error": "No founders found for this startup"}), 404
        
        # Set up QA system with only existing fields
        qa_system.current_startup = {
            "id": str(startup['startup_id']),
            "name": startup['name'],
            "description": startup.get('about_content', ''),
            "industry": startup.get('industry', ''),
            "logo": startup.get('logo_path', ''),
            "founders": founders
        }
        qa_system.setup_qa_chain()
        
        # Stream response
        def generate():
            try:
                process = qa_system.qa_chain.stream({"question": question})
                buffer = ""
                for chunk in process:
                    # Convert chunk to string
                    chunk_str = str(chunk.content) if hasattr(chunk, 'content') else str(chunk)
                    buffer += chunk_str
                    
                    # Split by newlines to handle partial chunks
                    while '\n' in buffer:
                        line, buffer = buffer.split('\n', 1)
                        yield f"data: {json.dumps({'text': line})}\n\n"
                    
                    # If no newline, send what we have
                    if buffer:
                        yield f"data: {json.dumps({'text': buffer})}\n\n"
                        buffer = ""
            except Exception as e:
                logging.error(f"Streaming error: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return Response(
            generate(),
            mimetype='text/event-stream',
            headers={
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        )
        
    except Exception as e:
        logging.error(f"Endpoint error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
@app.before_request
def limit_requests():
    time.sleep(0.1)

@app.route('/startups', methods=['GET'])
def list_startups():
    return jsonify({
        "startups": [
            {"id": id, "name": data["name"]} 
            for id, data in qa_system.manager.startups.items()
        ]
    })
@app.route('/load_startups_swipe', methods=['GET'])
def load_startups_swipe():
    try:
        supabase_inf = Supabase_Infrastructure()
        
        # Get all startups
        startups_data = supabase_inf.client.table("startup_table").select("*").execute()
        
        # Shuffle the startups
        shuffled_startups = list(startups_data.data)
        random.shuffle(shuffled_startups)
        
        # Limit to 20 startups
        startups = shuffled_startups[:10]
        
        # For each startup, get cofounder details
        for startup in startups:
            cofounder_ids = []
            if startup.get('cofounders'):
                try:
                    cofounder_ids = [int(id.strip()) for id in startup['cofounders'][1:-1].split(',')]
                except Exception as e:
                    logging.error(f"Error parsing cofounders: {str(e)}")
                    continue
            
            # Get cofounder details
            cofounders = []
            for user_id in cofounder_ids:
                try:
                    user_data = supabase_inf.client.table("user_table")\
                        .select("*")\
                        .eq("user_id", user_id)\
                        .execute()
                    
                    if user_data.data:
                        user = user_data.data[0]
                        cofounders.append({
                            "name": user.get('name', 'Unknown'),
                            "university": user.get('university', ''),
                            "major": user.get('major', ''),
                            "profile_pic": user.get('profile_pic_path', '')
                        })
                except Exception as e:
                    logging.error(f"Error fetching cofounder {user_id}: {str(e)}")
                    continue
            
            startup['cofounders'] = cofounders
        
        return jsonify({
            "success": True,
            "content": startups
        })
        
    except Exception as e:
        logging.error(f"Error in load_startups_swipe: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
@app.route('/startups/<int:startup_id>', methods=['GET'])
def get_startup(startup_id):
    try:
        supabase_inf = Supabase_Infrastructure()
        
        # Get the startup by ID
        startup = supabase_inf.get_startup_by_id(startup_id)
        
        if not startup:
            return jsonify({"success": False, "error": "Startup not found"}), 404
        
        # Parse cofounder IDs from the string format "(id1, id2)"
        cofounder_ids = []
        if startup.get('cofounders'):
            try:
                # Remove parentheses and split by commas
                cofounder_ids = [
                    int(id.strip()) 
                    for id in startup['cofounders'][1:-1].split(',')
                    if id.strip().isdigit()
                ]
            except Exception as e:
                logging.error(f"Error parsing cofounders: {str(e)}")
        
        # Get cofounder details
        cofounders = []
        for user_id in cofounder_ids:
            try:
                user_data = supabase_inf.client.table("user_table") \
                    .select("*") \
                    .eq("user_id", user_id) \
                    .execute()
                
                if user_data.data:
                    user = user_data.data[0]
                    cofounders.append({
                        "user_id": user['user_id'],
                        "name": user.get('name', 'Unknown'),
                        "university": user.get('university', ''),
                        "major": user.get('major', ''),
                        "profile_pic": user.get('profile_pic_path', ''),
                        "linkedin": user.get('linked_in_url', ''),
                        "about_me": user.get('about_me', '')
                    })
            except Exception as e:
                logging.error(f"Error fetching cofounder {user_id}: {str(e)}")
                continue
        
        # Prepare the response
        response_data = {
            "id": startup['startup_id'],
            "name": startup['name'],
            "description": startup.get('about_content', ''),
            "industry": startup.get('industry', ''),
            "logo": startup.get('logo_path', ''),
            "business_plan": startup.get('business_plan_content', ''),
            "cofounder_ids": cofounder_ids,
            "cofounders": cofounders
        }
        
        return jsonify({"success": True, "startup": response_data})
        
    except Exception as e:
        logging.error(f"Error in get_startup endpoint: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500
es = Elasticsearch(
    ["https://my-elasticsearch-project-b7242c.es.us-central1.gcp.elastic.cloud:443"],  # Or your cloud URL
    api_key=os.getenv("ELASTICSEARCH_API_KEY"),
    verify_certs=False,
    timeout=30,  # seconds
    max_retries=3,
    retry_on_timeout=True
)
embeddings = OpenAIEmbeddings()
# ---------------- mappings.py (or keep in ElasticSearchManager) ----------------
USER_MAPPING = {
    "mappings": {
        "properties": {
            "user_id":      {"type": "keyword"},
            "name":         {"type": "text"},
            "university":   {"type": "keyword"},
            "major":        {"type": "keyword"},
            "about_me":     {"type": "text"},

            # >>> top-level dense_vector, no multi-field <<<
            "about_me_vector": {
                "type":       "dense_vector",
                "dims":       1536,
                "index":      True,
                "similarity": "cosine"
            },

            "is_cofounder": {"type": "boolean"}
        }
    }
}

STARTUP_MAPPING = {
    "mappings": {
        "properties": {
            "startup_id":   {"type": "keyword"},
            "name":         {"type": "text"},
            "industry":     {"type": "keyword"},
            "about_content":{"type": "text"},

            "about_content_vector": {
                "type":       "dense_vector",
                "dims":       1536,
                "index":      True,
                "similarity": "cosine"
            },

            "cofounders":   {"type": "keyword"}
        }
    }
}

class ElasticSearchManager:
    def __init__(self):
        self.supabase      = Supabase_Infrastructure()
        self.user_index    = "user_index3"
        self.startup_index = "startup_index"
        self._ensure_indices_exist()

    def _ensure_indices_exist(self):
        """Create the two indices with correct mappings if they do not exist."""
        if not es.indices.exists(index=self.user_index):
            es.indices.create(index=self.user_index, body=USER_MAPPING)

        if not es.indices.exists(index=self.startup_index):
            es.indices.create(index=self.startup_index, body=STARTUP_MAPPING)
    def _build_query(self, query, query_embedding, field_name, search_type, limit):
        q = {
            "size": limit,
            "query": {"bool": {"should": []}}
        }
        if search_type in ("text", "hybrid"):
            q["query"]["bool"]["should"].append({
                "multi_match": {
                    "query":  query,
                    "fields": ["name^3", "about_me^2", "major", "university", "about_content", "industry"]
                }
            })
        if search_type in ("vector", "hybrid"):
            q["query"]["bool"]["should"].append({
                "script_score": {
                    "query": {"match_all": {}},
                    "script": {
                        "source": "cosineSimilarity(params.qv, params.field) + 1.0",
                        "params": {"qv": query_embedding, "field": field_name}
                    }
                }
            })
        return q
    def index_all_data(self):
        """Index all users and startups from Supabase"""
        self._index_users()
        self._index_startups()

    def _index_users(self):
        """Bulk index all users"""
        users = self.supabase.client.table("user_table").select("*").execute()
        
        actions = []
        for user in users.data:
            embedding = embeddings.embed_query(user.get('about_me', ''))
            actions.append({
                "_index": self.user_index,
                "_id": user['user_id'],
                "_source": {
                    **user,
                    "about_me_vector": embedding
                }
            })
        
        helpers.bulk(es, actions)
        logging.info(f"Indexed {len(actions)} users")

    def _index_startups(self):
        """Bulk index all startups"""
        startups = self.supabase.client.table("startup_table").select("*").execute()
        
        actions = []
        for startup in startups.data:
            embedding = embeddings.embed_query(startup.get('about_content', ''))
            actions.append({
                "_index": self.startup_index,
                "_id": startup['startup_id'],
                "_source": {
                    **startup,
                    "about_content_vector": embedding
                }
            })
        
        helpers.bulk(es, actions)
        logging.info(f"Indexed {len(actions)} startups")

    def _make_query(self, query, embed, vec_field, search_type, limit):
        """Return an ES DSL body that targets the given vector field."""
        body = {
            "size": limit,
            "query": {"bool": {"should": []}}
        }

        # text relevance
        if search_type in ("text", "hybrid"):
            body["query"]["bool"]["should"].append({
                "multi_match": {
                    "query":  query,
                    "fields": [
                        "name^3", "about_me", "about_content",
                        "major", "industry", "university"
                    ]
                }
            })

        # vector relevance
        if search_type in ("vector", "hybrid"):
            body["query"]["bool"]["should"].append({
                "script_score": {
                    "query": {"match_all": {}},
                    "script": {
                        "source": "cosineSimilarity(params.qv, params.field) + 1.0",
                        "params": {"qv": embed, "field": vec_field}
                    }
                }
            })
        return body

    # ---------- replace the entire existing search() method ----------
    def search(self, query: str, search_type: str = "hybrid", limit: int = 10):
        """Run text / vector / hybrid search across both indices."""
        query_embedding = embeddings.embed_query(query)

        # Build one body per index, each with its correct vector field
        user_query    = self._make_query(query, query_embedding,
                                         "about_me_vector",
                                         search_type, limit)

        startup_query = self._make_query(query, query_embedding,
                                         "about_content_vector",
                                         search_type, limit)

        # Execute
        user_hits    = es.search(index=self.user_index,    body=user_query)["hits"]["hits"]
        startup_hits = es.search(index=self.startup_index, body=startup_query)["hits"]["hits"]

        # Return just _source (add _score if you like)
        return {
            "users":    [hit["_source"] for hit in user_hits],
            "startups": [hit["_source"] for hit in startup_hits],
        }

# Initialize the search manager
search_manager = ElasticSearchManager()

@app.route('/search/reindex', methods=['POST'])
def reindex():
    """Endpoint to trigger reindexing of all data"""
    try:
        search_manager.index_all_data()
        return jsonify({"success": True, "message": "Data reindexed successfully"})
    except Exception as e:
        logging.error(f"Reindexing failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/search', methods=['GET'])
def search():
    """Main search endpoint"""
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({"error": "Query parameter 'q' is required"}), 400

        search_type = request.args.get('type', 'hybrid')
        limit = int(request.args.get('limit', 10))

        results = search_manager.search(query, search_type, limit)
        return jsonify({
            "success": True,
            "results": results
        })
    except Exception as e:
        logging.error(f"Search failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

# Health check endpoint
@app.route("/search/health", methods=["GET"])
def health_check():
    """
    GET /search/health
    Returns:
        {
            "status": "healthy" | "unavailable",
            "indices": {
                "users":    true | false,
                "startups": true | false
            }
        }
    """
    try:
        # Ping cluster
        cluster_ok = es.ping()                          # True/False

        # HeadApiResponse ➜ bool  (status 200 == exists)
        users_exists    = es.indices.exists(
            index=search_manager.user_index
        ).meta.status == 200

        startups_exists = es.indices.exists(
            index=search_manager.startup_index
        ).meta.status == 200

        return jsonify(
            status="healthy" if cluster_ok else "unavailable",
            indices={
                "users":    users_exists,
                "startups": startups_exists,
            },
        ), 200

    except Exception as exc:
        logging.exception("Elasticsearch health-check failed")
        return jsonify(status="error", details=str(exc)), 500
if __name__ == '__main__':
    print("Starting Flask server...")
    print("Server will be available at:")
    print("  - Local: http://localhost:8000")
    print("  - Network: http://0.0.0.0:8000")
    print("  - For tunneling, use ngrok: ngrok http 8000")
    print("  - Health check: http://localhost:8000/health")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',  # Allow external connections
        port=8000,       # Port 8000
        debug=True,      # Debug mode for development
        threaded=True    # Enable threading for multiple requests
    )