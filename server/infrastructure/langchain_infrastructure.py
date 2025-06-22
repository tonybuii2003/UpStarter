from elasticsearch import Elasticsearch
import os
from dotenv import load_dotenv
from langchain.agents import AgentExecutor, create_react_agent
import torch
import json
from infrastructure.custom_retrievers import CustomElasticsearchResumeRetriever, CustomElasticsearchStartupRetriever
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA, LLMChain
from langchain.prompts import PromptTemplate
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from infrastructure.elasticsearch_inf import Elasticsearch_Inf
from langchain.agents import tool
from infrastructure.supabase_inf import Supabase_Infrastructure
from langchain_core.prompts import ChatPromptTemplate
import openai
from functools import partial
from langchain_core.tools import Tool
os.environ["OPENAI_API_KEY"] = os.getenv("OPEN_AI_API_KEY")
load_dotenv()
openai.api_key = os.getenv("OPEN_AI_API_KEY")
TEMPLATE_RESUME = """
You are an AI assistant for a company called Upstarter, a company focusing on improving STEM candidates opportunities for landing jobs by matching
users with other cofounders and startups, at the same time you help startups land talent, allowing them to quickly buildup and tacke
challenges in the industry, you do not have the capacity to act in behalf of the company besides answering questions about the resume of candidates, this ifnormation will be
given to you in the context. Below is context given for you to answer a question which is also given below.

Context: {context}

Question: {question}

As an AI assistant you have no power of negotiating or doing a task besides answering questions about the current profile.

Answer:
"""

TEMPLATE_USER_PROFILE = """
You are an AI assistant for a company called Upstarter, a company focusing on improving STEM candidates opportunities for landing jobs by matching
users with other cofounders and startups, at the same time you help startups land talent, allowing them to quickly buildup and tacke
challenges in the industry, you do not have the capacity to act in behalf of the company besides answering questions about the resume of candidates, this ifnormation will be
given to you in the context. Below is context given for you to answer a question which is also given below.

Context: {context}

Question: {question}

As an AI assistant you have no power of negotiating or doing a task besides answering questions about the current profile.

Answer:
"""
SUPABASE_INF = Supabase_Infrastructure()
elasticsearch_inf = Elasticsearch_Inf()
def tool_helper(query):
        list_output = CustomElasticsearchResumeRetriever(elasticsearch_inf.client, "user_index3")._get_relevant_documents(query)
        ids_list = []
        for doc in list_output:
            ids_list.append(doc.metadata["id"])
        print(ids_list)
        return ids_list

def startup_tool_helper(query):
        list_output = CustomElasticsearchStartupRetriever(elasticsearch_inf.client, "startup_index")._get_relevant_documents(query)
        ids_list = []
        for doc in list_output:
            ids_list.append(doc.metadata["id"])
        print(ids_list)
        return ids_list

@tool
def return_relevant_users(query):
            """"Suggests potential cofounders matching the query,
            it returns the output in the format <RELEVANT_USERS>...<RELEVANT_USERS>"""
            user_ids = tool_helper(query)
            users = []

            return f"<USER_IDS>{user_ids}</USER_IDS>"
@tool
def return_relevant_startups(query):
            """"Suggests potential startups matching the query,
            it returns the output in the format <RELEVANT_STARTUPS>...<RELEVANT_STARTUPS>"""
            startup_ids = startup_tool_helper(query)
            startups = []
            return f"<STARTUP_IDS>{startup_ids}</STARTUP_IDS>"

@tool
def return_business_plan(query):
            """"Suggests potential startups matching the query,
            it returns the output in the format <RELEVANT_STARTUPS>...<RELEVANT_STARTUPS>"""
            startup_ids = startup_tool_helper(query)
            startups = []
            return f"json company metadata: {elasticsearch_inf.client.get(index='startup_index', id=2001)}. You have been provided all the necessary context to create a business plan for the company: Upstarter, create a detailed report. Ensure the final output include a <BUSINESS_PLAN> tag with the business plan"

@tool
def return_marketing_plan(query):
            """"Suggests potential startups matching the query,
            it returns the output in the format <RELEVANT_STARTUPS>...<RELEVANT_STARTUPS>"""
            startup_ids = startup_tool_helper(query)
            startups = []
            return f"json company metadata: {elasticsearch_inf.client.get(index='startup_index', id=2001)}. You have been provided all the necessary context to create a marketing plan for the company: Upstarter, create a detailed report. Ensure the final output include a <MARKETING_PLAN> tag with the marketing plan"

@tool
def return_company_description(query):
            """"Suggests potential startups matching the query,
            it returns the output in the format <RELEVANT_STARTUPS>...<RELEVANT_STARTUPS>"""
            startup_ids = startup_tool_helper(query)
            startups = []
            return f"json company metadata: {elasticsearch_inf.client.get(index='startup_index', id=2001)}. You have been provided all the necessary context to create a company description for potential investors for the company: Upstarter, create a detailed report. Ensure the final output include a <COMPANY_DESCRIPTION> tag with the company description"

@tool
def return_business_opportunity(query):
            """"Suggests potential startups matching the query,
            it returns the output in the format <RELEVANT_STARTUPS>...<RELEVANT_STARTUPS>"""
            startup_ids = startup_tool_helper(query)
            startups = []
            return f"json company metadata: {elasticsearch_inf.client.get(index='startup_index', id=2001)}. You have been provided all the necessary context to create a business opportunity description for potential investors for the company: Upstarter, create a detailed report. Ensure the final output include a <BUSINESS_OPPORTUNITY> tag with the business opportunity description"
    
class LangChain_Inf:
    def __init__(self):
        self.client = elasticsearch_inf.client
        self.resume_retriever = CustomElasticsearchResumeRetriever(self.client, "user_index3")
        self.user_profile_retriever = CustomElasticsearchResumeRetriever(self.client, "user_index3")

        self.setup_chains()
       
    def setup_chains(self):
        #self.llm = HuggingFacePipeline(pipeline=self.pipeline)
        self.llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0)
        self.resume_prompt = PromptTemplate(
            template=TEMPLATE_RESUME,
            input_variables=["context", "question"]
        )
        self.user_profile_prompt = PromptTemplate(
            template=TEMPLATE_USER_PROFILE,
            input_variables=["context", "question"]
        )

        self.llm_chain_resume = LLMChain(llm=self.llm, prompt=self.resume_prompt)
        self.llm_chain_user_profile = LLMChain(llm=self.llm, prompt=self.user_profile_prompt)
        self.stuff_resume_chain = StuffDocumentsChain(
            llm_chain=self.llm_chain_resume,
            document_variable_name="context"
        )

        self.stuff_user_profile_chain = StuffDocumentsChain(
            llm_chain=self.llm_chain_resume,
            document_variable_name="context"
        )

        self.chain_dict = {
            "resume_chain": RetrievalQA(
                combine_documents_chain=self.stuff_resume_chain,
                retriever=self.resume_retriever
            ),
             "about_me_chain": RetrievalQA(
                combine_documents_chain=self.stuff_user_profile_chain,
                retriever=self.user_profile_retriever
            )
        }

    def execute_search(self):
        try:
            print("hello")
            return self.client.search(index="*")
        except:
            print("error")
            return []

    def rag_resume(self, query):
        chain = self.chain_dict["resume_chain"]
        out = chain.run(query)
        return out
    
    def get_relevant_user_ids(self, query):
        
        list_output = self.resume_retriever._get_relevant_documents(query)
        ids_list = []
        for doc in list_output:
            ids_list.append(doc.metadata["id"])

        return ids_list
        

    def rag_profile(self, query):
        chain = self.chain_dict["about_me_chain"]
        print("CHAIN ABOUT TO RUN")
        out = chain.run(query)
        return out
    

    def workspace_agent(self, query):
        # agent scatchpad
        prompt =  prompt = ChatPromptTemplate.from_template("""
            Answer the following question as best you can. You have access to the following tools:

            {tools}

            Use the following format:

            Question: the input question you must answer
            Thought: you should always think about what to do
            Action: the action to take, should be one of [{tool_names}]
            Action Input: the input to the action
            Observation: the result of the action
            ... (this Thought/Action/Action Input/Observation can repeat N times)
            Thought: I now know the final answer
            Final Answer: the final answer to the original question
            Don't modify the brackets <BUSINESS_PLAN> OUTPUT_FROM_TOOL </BUSINESS_PLAN> <MARKETING_PLAN> OUTPUT_FROM_TOOL </MARKETING_PLAN> <COMPANY_DESCRIPTION> OUTPUT_FROM_TOOL </COMPANY_DESCRIPTION> <BUSINESS_OPPORTUNITY> OUTPUT_FROM_TOOL </BUSINESS_OPPORTUNITY>

            Begin!
           
            Question: {input}
            Thought:{agent_scratchpad}""")
        business_tool = Tool.from_function(func=return_business_plan, name="return_business_plan", description="Returns a detailed report for a business plan, must be explicitly asked.")
        marketing_tool = Tool.from_function(func=return_marketing_plan, name="return_marketing_plan", description="Returns a detailed report for a marketing plan, must be explicitly asked.")
        company_description_tool = Tool.from_function(func=return_company_description, name="return_company_description", description="Returns a detailed report for a company description, must be explicitly asked.")
        business_opportunity_tool = Tool.from_function(func=return_business_opportunity, name="return_business_opportunity", description="Returns a detailed report for a business opportunity, must be explicitly asked.")
        agent = create_react_agent(self.llm, [business_tool, marketing_tool, company_description_tool, business_opportunity_tool], prompt=prompt)
        agent_executor = AgentExecutor(agent=agent, tools=[business_tool, marketing_tool, company_description_tool, business_opportunity_tool], verbose=True, handle_parsing_errors=True)
        return agent_executor.invoke({"input": query})["output"]

    def agent_user_qa(self, user_id, question):
        print("in agent user  qa")
        prompt = ChatPromptTemplate.from_template("""
            Answer the following question as best you can. You have access to the following tools:

            {tools}

            Use the following format:

            Question: the input question you must answer
            Thought: you should always think about what to do
            Action: the action to take, should be one of [{tool_names}]
            Action Input: the input to the action
            Observation: the result of the action
            ... (this Thought/Action/Action Input/Observation can repeat N times)
            Thought: I now know the final answer
            Final Answer: the final answer to the original question
            Don't modify the brackets <USER_IDS> OUTPUT_FROM_TOOL </USER_IDS> DO NOT MODIFY THE OUTPUT ALSO DO NOT MODIFY <STARTUP_IDS> OUTPUT_FROM_TOOL </STARTUP_IDS>
            Example output: Here are the users: <USER_IDS> 1, 2 </USER_IDS> THIS IS THE GROUND TRUTH

            Begin!
           
            Question: {input}
            Thought:{agent_scratchpad}""")
        # create an llm agent which has a tool to return relevant user_ids
        # create a tool to return relevant user_ids
        # create an llm agent which has a tool to return relevant user_ids
        tool = Tool.from_function(func=return_relevant_users, name="return_relevant_users", description="Suggests potential cofounders based on the query only use when explicitly asked to suggest cofounders.")
        startup_tool = Tool.from_function(func=return_relevant_startups, name="return_relevant_startups", description="Suggests potential startups based on the query, only use when explicitly asked to suggest startups")
        agent = create_react_agent(self.llm, [tool, startup_tool], prompt=prompt)
        agent_executor = AgentExecutor(agent=agent, tools=[tool, startup_tool], verbose=True, handle_parsing_errors=True)
        return agent_executor.invoke({"input": question})["output"]


    
    def qa_user_id(self, query, user_id):

        resume  = self.client.get(index="user_index3", id=user_id)["_source"].get("resume")
        about_me = self.client.get(index="user_index3", id=user_id)["_source"].get("about_me")

        system_prompt = f'''You are a question/answering assistant which will receive questions regarding the resume of a
        user and their about_me section, use that information to answer questions'''
        user_prompt = f'''Resume: {resume} 
                        About_me: {about_me}
                        Question: {query}
'''
        response = openai.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": f'''{system_prompt}'''
            },
            {"role": "user", "content": f"{user_prompt}"}
        ],
        temperature=0.5,
        max_tokens=150
    )
        return response.choices[0].message.content
# Access the "resume" field
        



SAMPLE_RESUME = """Victor Samsonov
Chicago, IL   (872) 258 4810   vsamsonov@hawk.iit.edu   github.com/victorsamsonov   victorsamsonov.github.io/portfolio   kaggle.com/vicsonsam
MIT Judge and Mentor | MIT AI Awardee | Expertise in Machine Learning Engineering, resiliency and scalability | Azure certified Data Science Associate

PROFESSIONAL EXPERIENCE
    Software Engineer, Data Science Platform and Elasticsearch Team Lead	Dec 2023 - Present
RedMane Technology LLC	Chicago, Illinois
•	Delivering cutting-edge AI capabilities for core product, implementing a Data Science platform using cloud native solutions.
•	Leveraging a Machine Learning Engineering skillset within an R&D setting (Data Science, and Data Engineering).
•	Performed experiments and deployments of multiple ML models with Azure Machine Learning. Tracked relevant metadata and experiments using Mlflow.
•	Leveraged Kubernetes to deploy scalable Elasticsearch and Machine Learning applications, using + 50 pods.
•	Created a scalable indexing solution that handles indexing +1 Billion documents for multiple clients by devising a solution that is ~10.6 times faster. Performed ETL using Azure Data Factory
•	Implemented cloud-native microservices, using the Clean architecture and improved search capabilities using Elasticsearch. Created diagrams for my architecture.
•	Identified inefficient operations by analyzing distributions of multiple requests, improving performance by using redis cache and encoding json files, reducing time to completion by +200%.
Software Engineer, Machine Learning Intern	Jul 2023 – Dec 2023
Kaplan Institute, GradpathAI 	Chicago, Illinois
•	Led a team of Professors and Graduate students to develop a Full-stack AI app for automating class registration at Illinois Tech.
•	Devised a hybrid recommender system, expected to reduce graduation time by 1 semester for 1st generation college students.
•	Implemented an analytics tool for students to view grade distributions in a given course. Used React, Flask, AWS, LLMs, and PyTorch.
Full stack Data Science Intern, R&D	                 Aug 2023
CCC Intelligent Solutions	Chicago, Illinois
•	Worked on cutting-edge Deep Learning projects, using LangChain, AWS, Azure, PyTorch and the transformers libraries within an
auto-insurance and medical claim context (work resulted in landing a $1,000,000+ deal in 2024) .
•	Created a Full Stack AI app with Natural Language Processing, Computer Vision and Large Language Model features.
•	Worked on an end-to-end time series forecasting transformer for claim cost prediction targeting different car models with sMAPE 0.06.
Artificial Intelligence Engineer Intern	May 2022 –Aug 2022
Janova GMBH	Jena, Germany
•	Used Python, Tensorflow, Azure ML, and Azure Blob Storage to develop AI solutions for a smart table tennis racket app.
•	Improved the Data Processing pipeline with data augmentation and implemented a DNN for hit and type of swing detection, achieving
97.8% F1 Score resulting in winning awards such as Berlin startup Night, securing over €120,000.
•	Implemented the Versatile Quaternion Filter in a weakly supervised learning context for IMU pose estimation (5.32° RMSE).
 
PROJECTS
HackMIT Best Generative AI Data Analysis Hack winner, Generative AI Full-Stack project.	Sep 2023
•	Implemented a full- stack app which provides customized learning for STEM students leveraging LLMs. Won the award among 1078 competitors at the Massachusetts Institute of Technology.
TECHNOLOGIES: Python, LangChain, Google Cloud, Mathpix, AssemblyAI, and React.js
Kaggle Competition EDA | 17 ML models + DNN implementation (Gold Medal Kernel)	Jun 2022 – Aug 2022
•	Achieved top 7% performance, awarded Kaggle Expert Rank and became the top 20 most upvoted user among +3000 submissions.
TECHNOLOGIES: Python, Keras, TensorFlow, matplotlib, seaborn, LaTex, numpy, scipy, and scikit-learn
CERTIFICATIONS AND AWARDS
•	Mentor and Judge Hack Massachusetts Institute of Technology 2024
•	Hack Massachusetts Institute of Technology Best Generative AI project Award
•	Kaggle Expert, ranked 635th out of 308,366 users (Kernels)
•	Azure Data Science Associate (DP 100), AWS Certified Cloud Practitioner
•	Machine Learning Engineering for Production (MLOps) Specialization DeepLearning.AI
•	Upsilon Pi Epsilon recognition of outstanding talent in Computer Science
 
EDUCATION
ILLINOIS INSTITUTE OF TECHNOLOGY	2023
•	B.S. in Computer Science and M.S. in Artificial Intelligence, GPA: 4/4
Relevant Courses: Machine Learning, Deep Learning, Natural Language Processing, Advanced Artificial Intelligence, Big Data Technologies, Social Network Analysis, Generative AI, Software Engineering, Programming Paradigms and Patterns, Algorithms, and Data Integration, Warehousing and Provenance.
SKILLS
•	PROGRAMMING LANGUAGES: Python, R, F#, C#, JavaScript, Java, Haskell, Racket, C.
•	FRAMEWORKS: React, React Native, Node.js, Express.js., Rest API, FastAPI, Angular, Vue, ASP.NET
•	LIBRARIES: TensorFlow and Keras, TFX, PyTorch, Pandas, NumPy, scikit-learn, Matplotlib, OpenCV, Plotly, PySpark, and Scipy.
•	TOOLS AND TECHNOLOGIES: MySQL, Airflow, Azure, AWS, MongoDB, Elasticsearch, Kubernetes, Kafka, Snowflake, Mlflow and Hadoop
"""

SAMPLE_PROFILE = """
Victor Samsonov
Location: Chicago, IL
Contact: vsamsonov@hawk.iit.edu | (872) 258-4810
Portfolio: victorsamsonov.github.io/portfolio
GitHub: github.com/victorsamsonov
Kaggle: kaggle.com/vicsonsam

About Me
An innovative Machine Learning Engineer and Software Developer with expertise in building resilient, scalable AI solutions and cloud-native platforms. As an MIT judge and award-winning AI enthusiast, I excel at delivering impactful results by integrating advanced technologies, data engineering, and modern development practices.

Key Achievements
HackMIT Generative AI Hack Winner (2023): Built an LLM-powered app to customize STEM education, recognized among 1,078 participants.
Kaggle Expert: Top 7% in a machine learning competition with a Gold Medal Kernel; ranked 635th out of 308,366 users globally.
AI-Powered Racket (Janova GmbH): Designed a smart tennis racket achieving 97.8% F1 score for swing detection, securing €120,000 in funding and winning awards like Berlin Startup Night.
$1M Deal Impact (CCC Intelligent Solutions): Contributed to deep learning projects that closed a major deal in 2024.
Skills
Programming: Python, JavaScript, C#, R, Java, F#, Haskell, C, Racket.
Frameworks: React, Flask, FastAPI, Angular, Vue, Node.js, ASP.NET.
AI & ML Libraries: TensorFlow, PyTorch, TFX, scikit-learn, Pandas, NumPy, OpenCV.
Technologies: Azure, AWS, Kubernetes, Elasticsearch, Kafka, Snowflake, Hadoop, Airflow, Mlflow, MongoDB, MySQL.
Certifications: Azure Data Science Associate, AWS Certified Cloud Practitioner, MLOps Specialization (DeepLearning.AI).
Vision for Entrepreneurship
Empowering businesses to leverage AI for transformative growth by building scalable, efficient, and user-centric technology solutions. I aim to combine my expertise in machine learning engineering, software development, and cloud-native architecture to drive innovation in education, healthcare, and beyond.

Notable Projects
Automated Class Registration (GradpathAI): Built a hybrid recommender system to reduce graduation time by one semester for first-gen college students.
Custom AI Solutions (RedMane Technology): Devised a scalable indexing system capable of processing over 1 billion documents, achieving a 10.6x performance boost.
Generative AI for Learning: Developed an LLM-powered full-stack app to customize educational experiences, enhancing STEM learning outcomes.
Let's Connect!
I am passionate about solving complex challenges with cutting-edge AI, fostering innovation, and mentoring aspiring technologists. Whether you're an entrepreneur, investor, or technologist, I look forward to collaborating on transformative projects."""
# if __name__ == "__main__":
#     search_and_embeddings_infrastructure = LangChain_Inf()
#     #search_and_embeddings_infrastructure.index_embeddings(1, SAMPLE_RESUME, SAMPLE_PROFILE)
#     # response = search_and_embeddings_infrastructure.qa_user_id("What is the name and role of the user", 60)
#     response = search_and_embeddings_infrastructure.agent_user_qa(1, "Suggest me potential cofounders specialized in Ai")
    
#     print(response)

