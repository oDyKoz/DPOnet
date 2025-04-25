import { useState, useEffect } from 'react';
import './styles.css';

function MainLayout() {
  // Estados do chat
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://dpo-net.vercel.app/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pergunta: userMessage })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { text: data.resposta, sender: 'bot' }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.');
      setMessages(prev => [...prev, { 
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.', 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <ul>
          <li className="highlight"><i className="fi fi-rs-clipboard"></i>Relatórios</li>
          <li className="highlight"><i className="fi fi-rs-shield"></i>Canal de Comunicação</li>
          <li className="highlight"><i className="fi fi-rs-box-open"></i>Fornecedores</li>
          <li className="highlight"><i className="fi fi-rs-social-network"></i>Consentimentos</li>
          <li className="highlight"><i className="fi fi-rs-suitcase-alt"></i>Empresa</li>
          <li className="highlight"><i className="fi fi-rs-box"></i>Documentos</li>
          <li className="highlight"><i className="fi fi-rs-cookie-alt"></i>Cookies</li>
          <li className="highlight"><i className="fi fi-rs-user-lock"></i>Central da Privacidade</li>
        </ul>
        <button id="cda">Central De Acompanhamento</button>
      </div>

      <div className="main-content">
        <div className="header-main">
          <h1>Central de Acompanhamento</h1>
          <input type="text" placeholder="Buscar..." />
          <button><i className="fi fi-rs-interrogation"></i>Tutorial</button>
          <button className="filter"><i className="fi fi-rs-filter"></i>Filtros</button>
        </div>

        <section className="help-section">
          <div className="help-card">
            <span className="tag">Acompanhamento</span>
            <h3>Status do Processo</h3>
            <p>Veja o andamento do seu serviço.</p>
            <button>Visualizar Status</button>
          </div>
          <div className="help-card">
            <span className="tag">Acompanhamento</span>
            <h3>Downloads de Documentos</h3>
            <p>Acesse contratos e relatórios.</p>
            <button>Baixar Documentos</button>
          </div>
          <div className="help-card">
            <span className="tag">Acompanhamento</span>
            <h3>Histórico de Atendimento</h3>
            <p>Consulte interações anteriores.</p>
            <button>Ver Histórico</button>
          </div>
          <div className="help-card">
            <span className="tag">Acompanhamento</span>
            <h3>Checklist de Conformidade</h3>
            <p>Veja os próximos passos e obrigações.</p>
            <button>Acessar Checklist</button>
          </div>
          <div className="help-card">
            <span className="tag">Acompanhamento</span>
            <h3>Solicitação de Suporte</h3>
            <p>Abra um chamado rapidamente.</p>
            <button>Abrir Chamado</button>
          </div>
          <div className="help-card">
            <span className="tag">Acompanhamento</span>
            <h3>Gerenciamento de Incidentes</h3>
            <p>Gerencie incidentes de segurança relacionados a dados pessoais.</p>
            <button>Gerenciar</button>
          </div>
        </section>

        {/* Chatbot integrado */}
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
                {isLoading && (
                  <div className="message bot-message loading">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="chatbot-input">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !inputMessage.trim()}>
                  {isLoading ? '⌛' : '➤'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainLayout; 
