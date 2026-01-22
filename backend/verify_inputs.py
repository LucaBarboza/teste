import requests

url = "http://127.0.0.1:8000/teste-inputs"

data = {
    "nome": "Luca",
    "estilo": "Cartoon 3D Style",
    "universo": "Toy Story",
    "genero": "Adventure"
}

files = [
    ("imagens", ("test_img1.png", open("backend/test_img1.png", "rb"), "image/png")),
    ("imagens", ("test_img2.png", open("backend/test_img2.png", "rb"), "image/png"))
]

try:
    print("Enviando requisição para:", url)
    response = requests.post(url, data=data, files=files)
    
    if response.status_code == 200:
        print("\n✅ Sucesso! Resposta do Servidor:")
        print(response.json())
    else:
        print(f"\n❌ Erro {response.status_code}:")
        print(response.text)
except Exception as e:
    print(f"\n❌ Falha na conexão: {e}")
