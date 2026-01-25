import os
from dotenv import load_dotenv
import google.genai as genai

# Try to load .env
print(f"Current working directory: {os.getcwd()}")
loaded = load_dotenv()
print(f"dotenv loaded: {loaded}")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: GEMINI_API_KEY is None")
else:
    print(f"GEMINI_API_KEY found (length: {len(api_key)})")
    print(f"Key starts with: {api_key[:5]}...")
    print(f"Key ends with: ...{api_key[-5:]}")
    
    # Check for whitespace
    if api_key.strip() != api_key:
        print("WARNING: Key has leading/trailing whitespace!")
    
    # Try a simple generation
    try:
        print("\nAttempting to create Client...")
        client = genai.Client(api_key=api_key)
        
        print("Attempting to generate content...")
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Say hello"
        )
        print("SUCCESS! API Key is valid.")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"\nFAILURE: API Key check failed.")
        print(f"Error: {e}")
