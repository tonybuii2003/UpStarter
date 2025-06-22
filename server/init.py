import os
import csv
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
import requests

# Load environment variables
load_dotenv()

def initialize_supabase() -> Client:
    """Initialize Supabase client"""
    return create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

def execute_sql(supabase: Client, sql: str):
    """Execute raw SQL using the SQL editor endpoint"""
    headers = {
        'Authorization': f'Bearer {os.getenv("SUPABASE_KEY")}',
        'Content-Type': 'application/json'
    }
    response = requests.post(
        f"{os.getenv('SUPABASE_URL')}/rest/v1/rpc/execute_sql",
        headers=headers,
        json={'query': sql}
    )
    response.raise_for_status()
    return response.json()

def create_tables(supabase: Client):
    """Create tables using direct SQL execution"""
    tables_sql = [
        """
        CREATE TABLE IF NOT EXISTS founders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            potential TEXT,
            current_positions TEXT,
            education_levels TEXT,
            majors TEXT,
            universities TEXT,
            about_me TEXT,
            resume TEXT,
            user_id TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS startups (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            industry TEXT,
            about_us TEXT,
            business_plan TEXT,
            cofounders TEXT[],
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """
    ]
    
    for sql in tables_sql:
        execute_sql(supabase, sql)

def import_from_csv(supabase: Client, startups_path: str, founders_path: str):
    """Import data from CSV files"""
    # First import founders to get IDs
    founder_ids = {}
    with open(founders_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            founder_id = str(uuid.uuid4())
            founder_ids[row['names']] = founder_id
            
            supabase.table('founders').insert({
                'id': founder_id,
                'name': row['names'],
                'potential': row.get('potential', ''),
                'current_positions': row.get('current_positions', ''),
                'education_levels': row.get('education_levels', ''),
                'majors': row.get('majors', ''),
                'universities': row.get('universities', ''),
                'about_me': row.get('about_me', ''),
                'resume': row.get('resume', ''),
                'user_id': row.get('user_id', '')
            }).execute()

    # Then import startups with cofounder references
    with open(startups_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Convert comma-separated founder names to IDs
            cofounder_names = [name.strip() for name in row['cofounders'].split(',')]
            cofounder_ids = [founder_ids[name] for name in cofounder_names if name in founder_ids]
            
            supabase.table('startups').insert({
                'name': row['name'],
                'industry': row.get('industry', ''),
                'about_us': row.get('about_us', ''),
                'business_plan': row.get('business_plan', ''),
                'cofounders': cofounder_ids
            }).execute()

def main():
    supabase = initialize_supabase()
    
    # First create the execute_sql function in Supabase
    print("Setting up SQL execution function...")
    setup_sql = """
    CREATE OR REPLACE FUNCTION execute_sql(query TEXT)
    RETURNS JSON AS $$
    BEGIN
        EXECUTE query;
        RETURN json_build_object('status', 'success');
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'message', SQLERRM
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    """
    execute_sql(supabase, setup_sql)
    
    # Paths to your CSV files
    startups_csv = 'startups.csv'
    founders_csv = 'founders.csv'
    
    print("Creating tables...")
    create_tables(supabase)
    
    print(f"Importing data from {founders_csv} and {startups_csv}...")
    import_from_csv(supabase, startups_csv, founders_csv)
    
    print("\n✅ Data import completed successfully")

if __name__ == '__main__':
    main()