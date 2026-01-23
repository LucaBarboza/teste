
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import uvicorn

# Import the service
from genai_service import generate_story_with_gemini, generate_image_with_gemini
import shutil
import uuid
import os
import base64
import json
import re
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure temp directory for images exists
IMG_DIR = "generated_images_temp"
if not os.path.exists(IMG_DIR):
    os.makedirs(IMG_DIR)

# Ensure saved stories directory exists
STORIES_DIR = "saved_stories"
if not os.path.exists(STORIES_DIR):
    os.makedirs(STORIES_DIR)

# Mount the static directory to serve images
from fastapi.staticfiles import StaticFiles
app.mount("/images", StaticFiles(directory=IMG_DIR), name="images")
app.mount("/stories", StaticFiles(directory=STORIES_DIR), name="stories")

class InputResponse(BaseModel):
    status: str
    mensagem: str
    dados: dict

# Existing endpoint kept for reference or legacy
@app.post("/teste-inputs", response_model=InputResponse)
async def teste_inputs(
    nome: str = Form(..., description="Nome do usuário"),
    estilo: str = Form(..., description="Estilo de ilustração"),
    universo: str = Form(..., description="Universo escolhido"),
    genero: str = Form(..., description="Gênero da história"),
    imagens: List[UploadFile] = File(..., description="Imagens de referência")
):
    """
    Endpoint para testar o recebimento dos inputs do usuário.
    """
    
    # Processar informações das imagens (sem salvar por enquanto)
    detalhes_imagens = []
    for img in imagens:
        detalhes_imagens.append({
            "filename": img.filename,
            "content_type": img.content_type
        })
    
    return {
        "status": "sucesso",
        "mensagem": "Inputs recebidos e validados com sucesso!",
        "dados": {
            "nome": nome,
            "estilo": estilo,
            "universo": universo,
            "genero": genero,
            "imagens_recebidas": len(imagens),
            "detalhes_imagens": detalhes_imagens
        }
    }

@app.post("/api/generate-story")
async def generate_story_endpoint(
    nome: str = Form(...),
    estilo: str = Form(...),
    universo: str = Form(...),
    genero: str = Form(...),
    descricao: str = Form(None),
    imagens: List[UploadFile] = File(...)
):
    try:
        # Process images
        processed_images = []
        for img in imagens:
            content = await img.read()
            processed_images.append({
                "data": content,
                "mime_type": img.content_type
            })

        # Generate story
        story_data = generate_story_with_gemini(
            nome=nome,
            estilo=estilo,
            universo=universo,
            genero=genero,
            images=processed_images,
            descricao=descricao
        )
        
        return {
            "status": "success",
            "data": story_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-image")
async def generate_image_endpoint(
    prompt: str = Form(...),
    person_name: str = Form(...),
    universe_context: str = Form(...),
    reference_images: List[UploadFile] = File(...),
):
    try:
        # Process reference images
        processed_images = []
        for img in reference_images:
            content = await img.read()
            processed_images.append({
                "data": content,
                "mime_type": img.content_type
            })

        # Generate image
        image_bytes = await generate_image_with_gemini(
            prompt=prompt,
            reference_images=processed_images,
            person_name=person_name,
            universe_context=universe_context
        )
        
        # Save to file
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(IMG_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(image_bytes)
            
        # Construct URL (assuming local dev)
        # In production this should be a proper URL
        image_url = f"/images/{filename}"
        
        return {
            "status": "success",
            "image_url": image_url,
            "filepath": filepath
        }

    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def sanitize_filename(name):
    return re.sub(r'[<>:"/\\|?*]', '', name).strip()

class SaveStoryRequest(BaseModel):
    title: str
    cover_image_url: str
    chapters: List[dict] # {text: str, image_url: str}

@app.post("/api/save-story")
async def save_story_endpoint(story: SaveStoryRequest):
    try:
        # Create a safe folder name
        safe_title = sanitize_filename(story.title)
        # Add a UUID suffix to avoid collisions if titles are same
        unique_id = str(uuid.uuid4())[:8]
        folder_name = f"{safe_title}_{unique_id}"
        story_path = os.path.join(STORIES_DIR, folder_name)
        
        os.makedirs(story_path, exist_ok=True)

        # 1. Download/Copy images
        # Helper to handle image moving
        def process_image(url, prefix):
            # Extract filename from URL (assuming /images/filename.png)
            if "/images/" in url:
                original_filename = url.split("/images/")[-1]
                source_path = os.path.join(IMG_DIR, original_filename)
                
                new_filename = f"{prefix}_{original_filename}"
                dest_path = os.path.join(story_path, new_filename)
                
                if os.path.exists(source_path):
                    shutil.copy2(source_path, dest_path)
                    return new_filename
                else:
                    print(f"Warning: Image source not found: {source_path}")
                    return url
            return url

        # Process Cover
        saved_cover = process_image(story.cover_image_url, "cover")
        
        # Process Chapters
        saved_chapters = []
        for idx, chap in enumerate(story.chapters):
            saved_img = process_image(chap['image_url'], f"chap_{idx+1}")
            saved_chapters.append({
                "text": chap['text'],
                "image": saved_img
            })

        # 2. Save story.json
        final_story_data = {
            "title": story.title,
            "cover_image": saved_cover,
            "chapters": saved_chapters,
            "id": folder_name
        }
        
        with open(os.path.join(story_path, "story.json"), "w", encoding="utf-8") as f:
            json.dump(final_story_data, f, ensure_ascii=False, indent=2)

        # 3. Generate index.html (Standalone Site)
        template_path = os.path.join("backend", "template_site.html")
        if os.path.exists(template_path):
            shutil.copy2(template_path, os.path.join(story_path, "index.html"))

        return {
            "status": "success",
            "message": "História salva com sucesso!",
            "story_id": folder_name,
            "path": os.path.abspath(story_path)
        }

    except Exception as e:
        print(f"Error saving story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stories")
async def get_stories():
    try:
        stories = []
        if os.path.exists(STORIES_DIR):
            for folder in os.listdir(STORIES_DIR):
                folder_path = os.path.join(STORIES_DIR, folder)
                json_path = os.path.join(folder_path, "story.json")
                
                if os.path.isdir(folder_path) and os.path.exists(json_path):
                    try:
                        with open(json_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            # Fix image URLs for serving
                            data["cover_image"] = f"/stories/{folder}/{data['cover_image']}"
                            # We don't need all chapters for the list, just metadata
                            stories.append({
                                "id": folder,
                                "title": data["title"],
                                "cover": data["cover_image"]
                            })
                    except Exception:
                        continue
        return stories
    except Exception as e:
        print(f"Error listing stories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stories/{story_id}")
async def get_story_details(story_id: str):
    try:
        folder_path = os.path.join(STORIES_DIR, story_id)
        json_path = os.path.join(folder_path, "story.json")
        
        if not os.path.exists(json_path):
            raise HTTPException(status_code=404, detail="Story not found")
            
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Fix image URLs to be absolute server paths for the frontend
        data["cover_image"] = f"/stories/{story_id}/{data['cover_image']}"
        for chap in data["chapters"]:
            chap["image"] = f"/stories/{story_id}/{chap['image']}"
            
        return data
    except Exception as e:
        print(f"Error loading story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
