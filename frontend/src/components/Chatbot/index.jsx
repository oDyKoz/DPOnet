import React, { useState, useEffect } from 'react';
import './styles.css';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [error, setError] = useState(null);
    const [apiKey, setApiKey] = useState(null);

    // Carrega a chave da API de forma segura
    useEffect(() => {
        console.log('Iniciando carregamento da configuração...');
        fetch('/api/config')
            .then(response => {
                console.log('Resposta recebida:', response.status);
                if (!response.ok) {
                    throw new Error(`Erro ao carregar configuração: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dados recebidos:', data);
                if (data.apiKey) {
                    setApiKey(data.apiKey);
                    setError(null);
                    console.log('Chave da API carregada com sucesso');
                } else {
                    throw new Error('Chave da API não encontrada na resposta');
                }
            })
            .catch(err => {
                console.error('Erro ao carregar configuração:', err);
                setError('Erro ao carregar configuração do chatbot. Verifique se o servidor Flask está rodando (python app.py)');
            });
    }, []);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !apiKey) {
            if (!apiKey) {
                setError('Chave da API não disponível');
            }
            return;
        }

        const userMessage = inputMessage;
        setInputMessage('');
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);

        try {
            console.log('Enviando mensagem para a API com a chave:', apiKey);
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: userMessage
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                throw new Error('Resposta inválida da API');
            }

            const botResponse = data.candidates[0].content.parts[0].text;
            setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMessages(prev => [...prev, { 
                text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.', 
                sender: 'bot' 
            }]);
        }
    };

    return (
        <div className="chatbot-container">
            <button className="chatbot-toggle" onClick={toggleChat}>
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="chatbot-popup">
                    <div className="chatbot-header">
                        <h3>Assistente Virtual</h3>
                        <button onClick={toggleChat} className="close-button">✕</button>
                    </div>
                    
                    {error && (
                        <div className="chatbot-error">
                            {error}
                        </div>
                    )}
                    
                    <div className="chatbot-messages">
                        {messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                            >
                                {message.text}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={sendMessage} className="chatbot-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            disabled={!apiKey}
                        />
                        <button type="submit" disabled={!apiKey}>➤</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Chatbot; 
