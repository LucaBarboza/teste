
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

# Mount the static directory to serve images
from fastapi.staticfiles import StaticFiles
app.mount("/images", StaticFiles(directory=IMG_DIR), name="images")

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
