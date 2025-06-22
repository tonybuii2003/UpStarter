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
    
    




