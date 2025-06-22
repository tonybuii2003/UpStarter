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
from elasticsearch import Elasticsearch
from langchain_community.vectorstores import ElasticsearchStore
import json
import logging
import random
from infrastructure.supabase_inf import Supabase_Infrastructure

set_llm_cache(None)

app = Flask(__name__)
CORS(app)

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
es = Elasticsearch("http://localhost:9200")  # Update with your ES URL
embeddings = OpenAIEmbeddings()

class SearchManager:
    def __init__(self):
        self.supabase = Supabase_Infrastructure()
        self.index_name = "startup_matcher"
        
    def index_data(self):
        """Index both users and startups into Elasticsearch"""
        # Index users
        users = self.supabase.client.table("user_table").select("*").execute()
        for user in users.data:
            es.index(
                index=f"{self.index_name}_users",
                id=user['user_id'],
                body={
                    "name": user.get('name'),
                    "university": user.get('university'),
                    "major": user.get('major'),
                    "education_level": user.get('education_level'),
                    "is_cofounder": user.get('is_cofounder'),
                    "about_me": user.get('about_me'),
                    "embedding": embeddings.embed_query(user.get('about_me', ''))
                }
            )
        
        # Index startups
        startups = self.supabase.client.table("startup_table").select("*").execute()
        for startup in startups.data:
            es.index(
                index=f"{self.index_name}_startups",
                id=startup['startup_id'],
                body={
                    "name": startup.get('name'),
                    "industry": startup.get('industry'),
                    "about_content": startup.get('about_content'),
                    "business_plan_content": startup.get('business_plan_content'),
                    "embedding": embeddings.embed_query(startup.get('about_content', ''))
                }
            )

    def semantic_search(self, query: str, search_type: str = "both", limit: int = 5):
        """Perform hybrid search across users and startups"""
        query_embedding = embeddings.embed_query(query)
        
        # Elasticsearch semantic search
        if search_type in ["both", "users"]:
            user_results = es.search(
                index=f"{self.index_name}_users",
                body={
                    "query": {
                        "script_score": {
                            "query": {"match": {"about_me": query}},
                            "script": {
                                "source": """
                                    cosineSimilarity(params.query_vector, 'embedding') + 1.0
                                """,
                                "params": {"query_vector": query_embedding}
                            }
                        }
                    },
                    "size": limit
                }
            )
        
        if search_type in ["both", "startups"]:
            startup_results = es.search(
                index=f"{self.index_name}_startups",
                body={
                    "query": {
                        "script_score": {
                            "query": {"match": {"about_content": query}},
                            "script": {
                                "source": """
                                    cosineSimilarity(params.query_vector, 'embedding') + 1.0
                                """,
                                "params": {"query_vector": query_embedding}
                            }
                        }
                    },
                    "size": limit
                }
            )
        
        # Combine and format results
        results = {
            "users": [hit["_source"] for hit in user_results.get('hits', {}).get('hits', [])],
            "startups": [hit["_source"] for hit in startup_results.get('hits', {}).get('hits', [])]
        }
        
        return results

search_manager = SearchManager()

# Add new endpoint
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q')
    search_type = request.args.get('type', 'both')  # 'users', 'startups', or 'both'
    
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    try:
        results = search_manager.semantic_search(query, search_type)
        return jsonify({
            "success": True,
            "results": results
        })
    except Exception as e:
        logging.error(f"Search error: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)