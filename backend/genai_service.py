
import os
import asyncio
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# Load environment variables
# Load environment variables
load_dotenv(override=True)

# Configure Client
# Ensure GEMINI_API_KEY is set in your environment
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

class Story(BaseModel):
    title: str = Field(description="O título épico e chamativo da história.")
    cover_prompt: str = Field(description="Um prompt detalhado para gerar uma imagem de capa cinematográfica em formato wide (16:9).")
    parts: List[List[str]] = Field(
        description="Uma lista de exatamente 5 elementos. Cada elemento é uma lista com 2 strings: [texto_da_historia, prompt_de_imagem]. O texto deve ter aprox 250 palavras.",
        min_length=5,
        max_length=5
    )

def generate_story_with_gemini(
    nome: str,
    estilo: str,
    universo: str,
    genero: str,
    images: List[Dict[str, Any]], # [{"data": bytes, "mime_type": str}]
    descricao: str = None
) -> Dict[str, Any]:
    """
    Generates a structured story using Gemini 1.5 Flash (or 'Gemini 3' per request equivalent).
    """

    # Handle description logic
    tema_descricao = f"TEMA/DESCRIÇÃO: {descricao}" if descricao else "TEMA: LIVRE/ALEATÓRIO. Crie uma história surpreendente e criativa baseada no universo e gênero."
    
    # Construct the prompt
    prompt_text = f"""
    Crie uma história épica e imersiva dividida em EXATAMENTE 5 CAPÍTULOS.
    
    INFORMAÇÕES DO PROTAGONISTA:
    - O protagonista é a pessoa que aparece nas imagens fornecidas. Identifique suas características visuais para manter consistência nos prompts de imagem sugeridos.
    - Nome: {nome}
    
    CONFIGURAÇÃO DA HISTÓRIA:
    - Universo: {universo} (A história deve se passar neste universo)
    - Estilo Visual/Artístico: {estilo} (A narrativa e o tom da escrita devem harmonizar com este estilo visual. Ex: Se for 'Noir', a escrita deve ser misteriosa; se for 'Cartoon', mais leve e divertida.)
    - Gênero: {genero}
    - {tema_descricao}
    
    REQUISITOS DA SAÍDA:
    Gere um JSON estritamente com a estrutura:
    - title: Título da história.
    - cover_prompt: Prompt para a capa (16:9), descrevendo o protagonista ({nome}) no universo {universo} com estilo {estilo}.
    - parts: Uma lista de 5 listas. Cada lista interna deve conter:
        1. Texto do capítulo (aprox. 250 palavras). A escrita DEVE refletir o universo {universo}, o gênero {genero} e o tom do estilo {estilo}.
        2. Prompt de imagem para o capítulo. Deve descrever a cena correspondente, incluindo o protagonista ({nome}) e o ambiente, no estilo {estilo}.
    
    IMPORTANTE:
    - O texto da história deve ser influenciado por: Nome, Universo, Estilo, Gênero e Descrição.
    - As IMAGENS (fotos enviadas) servem APENAS para saber como é o rosto do protagonista nos prompts de imagem. NÃO use detalhes das fotos (ex: roupas que ele está usando na foto) no texto da história, a menos que faça sentido no universo.
    """

    contents = []
    
    # Add text prompt
    contents.append(prompt_text)
    
    # Add images
    for img in images:
        contents.append(types.Part.from_bytes(data=img["data"], mime_type=img["mime_type"]))
            
    try:
        if not client:
            raise ValueError("GEMINI_API_KEY not found. Please configure .env file.")

        response = client.models.generate_content(
            model="gemini-3-flash-preview", # As per _modelo/historia.py
            contents=contents,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": Story.model_json_schema(),
            },
        )
        
        if not response or not response.text:
            raise ValueError("Resposta vazia da API")

        story_data = Story.model_validate_json(response.text)
        
        return story_data.model_dump()

    except Exception as e:
        print(f"Error generating story: {e}")
        raise e

async def generate_image_with_gemini(
    prompt: str,
    reference_images: List[Dict[str, Any]],
    person_name: str,
    universe_context: str,
    aspect_ratio: str = "2:3"
) -> bytes:
    """
    Generates a single image using Gemini 3 Pro Image Preview with visual identity consistency.
    """
    
    # Construct the instruction ensuring identity lock and style adherence
    instruction = f"""
    {prompt}
    
    IMPORTANTE: O personagem principal desta imagem deve ser exatamente a mesma pessoa que aparece nas fotos anexadas ({person_name}). Mantenha as características faciais e adaptações ao universo: {universe_context}.
    Use the uploaded selfie as identity reference - IDENTITY LOCK (match face/skin/hair/light).
    """
    
    contents = []
    contents.append(instruction)
    
    # Add reference images for identity
    for img in reference_images:
        contents.append(types.Part.from_bytes(data=img["data"], mime_type=img["mime_type"]))

    attempts = 3
    for attempt in range(attempts):
        try:
            if not client:
                raise ValueError("GEMINI_API_KEY not found.")
            
            print(f"Generating image (Attempt {attempt+1}/{attempts})...")
            
            # Using client.aio for async generation
            response = await client.aio.models.generate_content(
                model="gemini-3-pro-image-preview",
                contents=contents,
                config=types.GenerateContentConfig(
                    response_modalities=['IMAGE'],
                    image_config=types.ImageConfig(aspect_ratio=aspect_ratio, image_size="2K"),
                )
            )

            for part in response.parts:
                if part.inline_data:
                    return part.inline_data.data
            
            raise ValueError("No valid image data in response.")

        except Exception as e:
            print(f"Error generating image (Attempt {attempt+1}): {e}")
            if attempt < attempts - 1:
                await asyncio.sleep(2)
            else:
                raise e
