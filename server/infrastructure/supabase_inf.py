from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()
url: str = "https://hosyimyvjmhzgxhnocsv.supabase.co"
api_key = os.getenv("SUPABASE_API_KEY")
CLIENT = create_client(url, api_key)

class Supabase_Infrastructure:
    def __init__(self):
        self.client = CLIENT
    
    def get_user_by_id(self, user_id):
        response = self.client.table("user_table").select("*").eq("user_id", user_id).execute()
        user = response.data[0] if response.data else None
        return user

    def get_startup_by_id(self, user_id):
        response = self.client.table("startup_table").select("*").eq("startup_id", user_id).execute()
        startup = response.data[0] if response.data else None
        return startup


test = Supabase_Infrastructure()
print(test.get_user_by_id(54))



