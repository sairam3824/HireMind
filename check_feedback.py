import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    # Try reading from frontend/.env.local if .env is missing/empty
    try:
        with open('frontend/.env.local', 'r') as f:
            for line in f:
                if 'NEXT_PUBLIC_SUPABASE_URL' in line:
                    url = line.split('=')[1].strip().strip('"')
                if 'NEXT_PUBLIC_SUPABASE_ANON_KEY' in line:
                    key = line.split('=')[1].strip().strip('"')
    except:
        pass

if not url or not key:
    print("Missing Supabase credentials")
    exit(1)

print(f"Connecting to {url}")
try:
    supabase = create_client(url, key)
    response = supabase.table("feedback").select("*").execute()
    print(f"Found {len(response.data)} feedback entries.")
    if len(response.data) > 0:
        print(response.data)
except Exception as e:
    print(f"Error: {e}")
