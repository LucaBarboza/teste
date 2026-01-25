import os
from dotenv import load_dotenv, find_dotenv
import google.genai as genai

cwd = os.getcwd()
print(f"Current working directory: {cwd}")

env_path = os.path.join(cwd, ".env")
print(f"Targeting .env path: {env_path}")

if os.path.exists(env_path):
    print("File exists!")
    with open(env_path, "r") as f:
        content = f.read()
        print(f"File content preview: {content[:15]}...{content[-5:]}")
else:
    print("FILE DOES NOT EXIST!")

# Load with explicit path
loaded = load_dotenv(dotenv_path=env_path, override=True)
print(f"dotenv loaded (explicit path): {loaded}")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: GEMINI_API_KEY is None")
else:
    print(f"GEMINI_API_KEY found (length: {len(api_key)})")
    
    if api_key.endswith("NLBA8"):
        print("MATCH: Finally got the correct key.")
    else:
        print(f"MISMATCH: Still getting wrong key ending in ...{api_key[-5:]}")
