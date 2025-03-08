import os
import openai
from dotenv import load_dotenv

# Carrega a chave da OpenAI do arquivo .env
load_dotenv()
API_KEY = os.getenv("API_KEY")

# Configura a API key corretamente
openai.api_key = API_KEY

# Função para conversar com o ChatGPT
def chat_com_gpt(mensagem):
    resposta = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # Ou "gpt-3.5-turbo"
        messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ]
)
    return resposta["choices"][0]["message"]["content"]

# Loop de interação
print("ChatGPT no Python! Digite 'sair' para encerrar.")
while True: 
    user_input = input("Você: ")
    if user_input.lower() == "sair":
        print("ChatGPT: Até mais!")
        break
    resposta = chat_com_gpt(user_input)
    print(f"ChatGPT: {resposta}")

