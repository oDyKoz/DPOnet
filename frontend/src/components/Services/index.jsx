import './styles.css';

function Services() {
  return (
    <section id="servicos" className="services">
      <h2>Nossos Serviços</h2>
      <div className="services-grid">
        <div className="service-card">
          <h3>Consultoria LGPD</h3>
          <p>Adequação completa à Lei Geral de Proteção de Dados</p>
        </div>
        <div className="service-card">
          <h3>Treinamentos</h3>
          <p>Capacitação em proteção de dados para sua equipe</p>
        </div>
        <div className="service-card">
          <h3>Assessoria Contínua</h3>
          <p>Suporte constante em questões de privacidade</p>
        </div>
      </div>
    </section>
  );
}

export default Services; 