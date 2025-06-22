from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.supabase_inf import Supabase_Infrastructure
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

@app.get("/load_users_swipe")
async def load_users_swipe(

):
    supabase_inf = Supabase_Infrastructure()
    user_ids = [i for i in range(2000)]
    # randomly select 50
    random.shuffle(user_ids)
    user_ids = user_ids[:25]
    users = []
    for user_id in user_ids:
        users.append(supabase_inf.get_user_by_id(f"{user_id}"))
    print("success users")

    return {"success": 200, "content": users}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)