from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import time
from typing import Dict, Optional
from dotenv import load_dotenv
load_dotenv()
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough
from langchain.globals import set_llm_cache
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
    if not qa_system.set_startup(startup_id):
        return jsonify({"error": "Invalid startup ID"}), 400
    
    question = request.json.get('question', '')
    try:
        response = qa_system.ask_about_founders(question)
        return jsonify({
            "answer": response.content,
            "startup": qa_system.current_startup["name"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ask_stream/<startup_id>', methods=['POST'])
def ask_stream(startup_id):
    if not qa_system.set_startup(startup_id):
        return jsonify({"error": "Invalid startup ID"}), 400
    
    question = request.json.get('question', '')
    
    def generate():
        try:
            for chunk in qa_system.qa_chain.stream({"question": question}):
                if hasattr(chunk, 'content'):  # For AIMessage objects
                    yield f"data: {chunk.content}\n\n"
                elif isinstance(chunk, dict) and 'response' in chunk:
                    yield f"data: {chunk['response']}\n\n"
                time.sleep(0.05)
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
    
    return Response(stream_with_context(generate()), mimetype='text/event-stream')

@app.route('/startups', methods=['GET'])
def list_startups():
    return jsonify({
        "startups": [
            {"id": id, "name": data["name"]} 
            for id, data in qa_system.manager.startups.items()
        ]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)