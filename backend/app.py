import os
from dotenv import load_dotenv
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import time

# Carregar variáveis de ambiente
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("API Key não encontrada no arquivo .env")

# Configuração do Gemini
try:
    genai.configure(api_key=api_key)
    modelo = genai.GenerativeModel("gemini-1.5-flash")
except Exception as e:
    raise ValueError(f"Erro ao configurar Gemini: {str(e)}")

# Configuração do Flask
app = Flask(__name__)
CORS(app)

# Rate limiting
def rate_limit(limit=10, per=60):
    def decorator(f):
        requests = {}
        @wraps(f)
        def wrapped(*args, **kwargs):
            now = time.time()
            ip = request.remote_addr
            if ip in requests:
                if now - requests[ip]['time'] < per:
                    if requests[ip]['count'] >= limit:
                        return jsonify({'error': 'Limite de requisições excedido'}), 429
                    requests[ip]['count'] += 1
                else:
                    requests[ip] = {'time': now, 'count': 1}
            else:
                requests[ip] = {'time': now, 'count': 1}
            return f(*args, **kwargs)
        return wrapped
    return decorator

# Contexto inicial
contexto = """
Você é um assistente virtual especializado na empresa DPO.net.
Seu objetivo é fornecer informações claras e resumidas sobre os serviços da DPO.net,
focando em temas como LGPD, proteção de dados, consultoria e assessoria jurídica.

Se não souber a resposta, diga que só pode responder sobre a DPO.net.
Se a pergunta for ofensiva ou inadequada, peça que o usuário mantenha o respeito.
"""

# Função para verificar macros
def verificar_macros(pergunta):
    macros = {
        "contato": "Para entrar em contato conosco, envie um e-mail para contato@dpnet.com.br.",
        "comunicar": "Para entrar em contato conosco, envie um e-mail para contato@dpnet.com.br.",
        "comunicação": "Para entrar em contato conosco, envie um e-mail para contato@dpnet.com.br.",
        "suporte": "Nosso suporte pode ser acessado pelo e-mail suporte@dpnet.com.br.",
        "horário": "Nosso horário de atendimento é de segunda a sexta-feira, das 9h às 18h.",
        "site": "Você pode acessar nosso site em www.dpnet.com.br para mais informações.",
        "agendar": "Para agendar uma conversa e obter mais informações sobre nossos serviços, por favor, visite nosso site em www.dponet.com.br e preencha o formulário de contato. Você também pode entrar em contato conosco pelo telefone +55 (11) 5199-3959 ou pelo e-mail dpo@netbr.com.br. Nossa equipe entrará em contato o mais breve possível para agendar uma reunião.",
        "agendamento": "Para agendar uma conversa e obter mais informações sobre nossos serviços, por favor, visite nosso site em www.dponet.com.br e preencha o formulário de contato. Você também pode entrar em contato conosco pelo telefone +55 (11) 5199-3959 ou pelo e-mail dpo@netbr.com.br. Nossa equipe entrará em contato o mais breve possível para agendar uma reunião.",
        "cnpj": "O CNPJ da DPO.net é 36.487.128/0001-79.",
        "sede": "A DPOnet tem uma sede em Marília, São Paulo, localizada na Avenida das Esmeraldas 3865, Torre Tókyo, salas 103 e 104",
        "local": "A DPOnet tem uma sede em Marília, São Paulo, localizada na Avenida das Esmeraldas 3865, Torre Tókyo, salas 103 e 104",
        "localização": "A DPOnet tem uma sede em Marília, São Paulo, localizada na Avenida das Esmeraldas 3865, Torre Tókyo, salas 103 e 104",
        "endereço": "A DPOnet tem uma sede em Marília, São Paulo, localizada na Avenida das Esmeraldas 3865, Torre Tókyo, salas 103 e 104"
    }

    pergunta = pergunta.lower()
    for chave, resposta in macros.items():
        if chave in pergunta:
            return resposta
    return None

# Função para obter resposta do modelo Gemini
def obter_resposta_gemini(pergunta):
    try:
        contexto_completo = f"{contexto}\nUsuário: {pergunta}\nChatbot:"
        resposta = modelo.generate_content(contexto_completo)
        return resposta.text
    except Exception as e:
        return f"Erro ao processar sua pergunta: {str(e)}"

# Rota para comunicação com o frontend
@app.route("/chat", methods=["POST"])
@rate_limit(limit=10, per=60)
def chat():
    try:
        dados = request.get_json()
        pergunta = dados.get("pergunta", "").strip()

        if not pergunta:
            return jsonify({"error": "Nenhuma pergunta fornecida"}), 400

        # Verificar macros primeiro
        resposta_macro = verificar_macros(pergunta)
        if resposta_macro:
            return jsonify({"resposta": resposta_macro})

        # Se não for uma macro, usar o modelo Gemini
        resposta = obter_resposta_gemini(pergunta)
        return jsonify({"resposta": resposta})

    except Exception as e:
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=5000)
