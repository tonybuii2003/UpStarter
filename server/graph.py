from typing import Dict, Optional
from dotenv import load_dotenv
load_dotenv()
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough
from langchain.globals import set_llm_cache
set_llm_cache(None)

class StartupManager:
    def __init__(self):
        self.startups = {
            "ecovision": {
                "id": "ecovision",
                "name": "EcoVision AI",
                "description": "An AI-powered platform that helps businesses reduce their carbon footprint through predictive analytics",
                "founding_year": 2022,
                "industry": "Climate Tech / AI",
                "funding_stage": "Series A",
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
                ],
                "key_milestones": [
                    "Won 2023 Green Tech Innovation Award",
                    "Raised $15M Series A led by Greentech Capital",
                    "Partnered with 50+ enterprises to reduce emissions"
                ]
            },
            "agritech": {
                "id": "agritech",
                "name": "AgriTech Solutions",
                "description": "AI-driven solutions for sustainable agriculture",
                "founding_year": 2021,
                "industry": "AgriTech",
                "funding_stage": "Series B",
                "founders": [
                    {
                        "name": "Dr. Raj Patel",
                        "title": "CEO & Founder",
                        "background": "PhD in Agricultural Engineering from UC Davis, former director of research at Monsanto",
                        "skills": ["Precision Agriculture", "IoT Systems", "Data Analysis"],
                        "interests": ["Food security", "Climate resilience", "Robotics"],
                        "fun_fact": "Developed an AI system that predicts crop yields with 95% accuracy"
                    }
                ],
                "key_milestones": [
                    "Deployed in 500+ farms nationwide",
                    "Won 2022 UN Sustainability Award",
                    "Reduced water usage by 40% in pilot programs"
                ]
            }
        }

    def get_startup(self, startup_id: str) -> Optional[Dict]:
        return self.startups.get(startup_id)

    def list_startups(self) -> Dict[str, str]:
        return {id: data["name"] for id, data in self.startups.items()}

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
        template = """You are an AI assistant that answers questions about the founders of {company_name}.
        Use only the following information about the founders:
        
        {founders_info}
        
        Current conversation:
        Human: {question}
        AI:"""
        
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
            raise ValueError("No startup selected. Please set a startup first.")
        return self.qa_chain.invoke(question)

def founder_chat():
    qa_system = FounderQA()
    
    print("🚀 Welcome to Startup Founder Information System")
    print("Available startups:")
    for id, name in qa_system.manager.list_startups().items():
        print(f"- {id}: {name}")
    
    while True:
        startup_id = input("\nEnter startup ID (or 'exit' to quit): ").strip().lower()
        if startup_id in ['exit', 'quit']:
            break
        
        if not qa_system.set_startup(startup_id):
            print(f"Error: Invalid startup ID '{startup_id}'")
            continue
        
        current_startup = qa_system.current_startup
        print(f"\n✨ Now exploring: {current_startup['name']}")
        print(current_startup['description'])
        print("\nFounders:")
        for founder in current_startup["founders"]:
            print(f"- {founder['name']} ({founder['title']})")
        
        while True:
            question = input("\nAsk about founders (or 'back' to switch startups): ").strip()
            if question.lower() in ['back', 'switch']:
                break
            if question.lower() in ['exit', 'quit']:
                return
            
            try:
                response = qa_system.ask_about_founders(question)
                print("\nFounder Info:")
                print(response.content)
            except Exception as e:
                print(f"\nError: {str(e)}")

if __name__ == "__main__":
    founder_chat()