import os
from dotenv import load_dotenv
import google.genai as genai

# Try to load .env WITH OVERRIDE
print(f"Current working directory: {os.getcwd()}")
loaded = load_dotenv(override=True)
print(f"dotenv loaded (override=True): {loaded}")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: GEMINI_API_KEY is None")
else:
    print(f"GEMINI_API_KEY found (length: {len(api_key)})")
    print(f"Key starts with: {api_key[:5]}...")
    print(f"Key ends with: ...{api_key[-5:]}")
    
    # Check if it matches the expected one (ending in NLBA8)
    if api_key.endswith("NLBA8"):
        print("MATCH: This is the key from the local .env file.")
    else:
        print("MISMATCH: This is STILL NOT the key from the local .env file.")

    # Try a simple generation with a known supported model (gemini-1.5-flash should be standard, but maybe the key is restricted?)
    try:
        print("\nAttempting to create Client...")
        client = genai.Client(api_key=api_key)
        
        print("Attempting to generate content...")
        # valid model check
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Say hello"
        )
        print("SUCCESS! API Key is valid.")
    except Exception as e:
        print(f"\nFAILURE: API Key check failed.")
        print(f"Error: {e}")
