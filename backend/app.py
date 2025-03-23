import os
from dotenv import load_dotenv
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS


# Carregar variáveis de ambiente
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)


# Configuração do Flask
app = Flask(__name__)
CORS(app)


# Modelo Gemini Pro
modelo = genai.GenerativeModel("gemini-1.5-pro")


# Contexto inicial
contexto = """
Você é um assistente virtual especializado na empresa DPO.net.
Seu objetivo é fornecer informações claras e resumidas sobre os serviços da DPO.net,
focando em temas como LGPD, proteção de dados, consultoria e assessoria jurídica.


Se não souber a resposta, diga que só pode responder sobre a DPO.net.
Se a pergunta for ofensiva ou inadequada, peça que o usuário mantenha o respeito.
"""


# Função para obter resposta do modelo Gemini
def obter_resposta_como_gemini(pergunta):
   # Construção do contexto completo com a pergunta
   contexto_completo = contexto + "\nUsuário: " + pergunta + "\nChatbot:"


   try:
       # Gerar resposta usando o modelo Gemini
       resposta = modelo.generate_content(contexto_completo)
       return resposta.text
   except Exception as e:
       return f"Erro ao comunicar com a API: {str(e)}"


# Função para verificar macros
def verificar_macros(pergunta):
   # Dicionário de macros
   macros = {
       "contato": "Para entrar em contato conosco, envie um e-mail para contato@dpnet.com.br.",
       "suporte": "Nosso suporte pode ser acessado pelo e-mail suporte@dpnet.com.br.",
       "horário": "Nosso horário de atendimento é de segunda a sexta-feira, das 9h às 18h.",
       "site": "Você pode acessar nosso site em www.dpnet.com.br para mais informações.",
   }


   # Verificar se a pergunta contém alguma palavra-chave para macro
   pergunta = pergunta.lower()
   for chave, resposta in macros.items():
       if chave in pergunta:
           return resposta


   # Caso não tenha encontrado, retornar None (significa que a pergunta não é uma macro)
   return None


# Função para obter resposta, considerando macros primeiro, depois o modelo Gemini
def obter_resposta(pergunta):
   # Verificar se a pergunta se encaixa em alguma macro
   resposta_macro = verificar_macros(pergunta)
   if resposta_macro:
       return resposta_macro


   # Se não for uma macro, utilizar o modelo Gemini
   return obter_resposta_como_gemini(pergunta)


# Rota para comunicação com o frontend
@app.route("/chat", methods=["POST"])
def chat():
   dados = request.get_json()
   pergunta = dados.get("pergunta", "")


   if not pergunta:
       return jsonify({"resposta": "Erro: Nenhuma pergunta fornecida"}), 400


   # Obter resposta baseada na pergunta
   resposta = obter_resposta(pergunta)
   return jsonify({"resposta": resposta})


# Rota adicional para enviar mensagens
@app.route("/send_message", methods=["POST"])
def send_message():
   data = request.get_json()
   user_message = data.get("message", "")


   if not user_message:
       return jsonify({"response": "Erro: Nenhuma mensagem fornecida"}), 400


   # Obter resposta baseada na pergunta
   resposta = obter_resposta(user_message)
   return jsonify({"response": resposta})


# Inicia o servidor Flask
if __name__ == "__main__":
   app.run(debug=True)



