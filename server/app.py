from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.supabase_inf import Supabase_Infrastructure
from infrastructure.langchain_infrastructure import LangChain_Inf
from fastapi import FastAPI, File, UploadFile, Form
from typing import Optional
import logging
import random

app =  FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/test")
async def upload_image(
   
):
    return {"success": 200, "content": "hello"}


@app.post("/agent_user_qa")
async def agent_user_qa(
    user_id: str,
    question: str
):
    supabase_inf = Supabase_Infrastructure()
    user = supabase_inf.get_user_by_id(f"{user_id}")

    user["about_me"]
    startup = supabase_inf.get_startup_by_id(f"{startup_id}")
    return {"success": 200, "content": "hello"}

@app.get("/load_users_swipe")
async def load_users_swipe(

):
    supabase_inf = Supabase_Infrastructure()
    user_ids = [i for i in range(2000)]
    startup_ids = [i for i in range(1000)]
    # randomly select 50
    random.shuffle(user_ids)
    random.shuffle(startup_ids)
    user_ids = user_ids[:10]
    startup_ids = startup_ids[:10]
    users = []
    for user_id in user_ids:
        doc = supabase_inf.get_user_by_id(f"{user_id}")
        doc["type"] = "user"
        # generate a random seed for the user
        doc["seed"] = random.randint(0, 100)
        users.append(doc)
    # tdo the same but for 10 startups (supabse_inf.get_startups_by_id(f"{user_id}"))
    startups = []
    for startup_id in startup_ids:
         doc = supabase_inf.get_startup_by_id(f"{startup_id}")
         doc["type"] = "startup"
         print(doc)
         doc["seed"] = random.randint(0, 100)
         startups.append(doc)
    
    output = users + startups
    # interleave the two lists
    output = [item for pair in zip(users, startups) for item in pair]
    

    print("success users")


    return {"success": 200, "content": output}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)