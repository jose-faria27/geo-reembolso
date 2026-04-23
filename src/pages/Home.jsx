// ...existing code...
import React, { useState, useEffect } from "react";
import "./Home.css";
import { UserPlus, ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handlePrimeiroAcesso = () => {
    setShowModal(true);
  };

  const openForm = () => {
    window.open("https://app.pipefy.com/public/form/7Fu3ZNEu", "_blank");
    setShowModal(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="container fade-in">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
          <h3>Portal de Reembolso</h3>
        </div>
      </header>

      {/* MAIN */}
      <main className="main">
        <h1>
          Bem-vindo ao <span>Processo<br /> de Reembolso</span>
        </h1>

        <p>
          Submeta suas solicitações de reembolso e acompanhe cada etapa do
          processo.
          <br /><br/>
          Se este é o seu primeiro pedido de reembolso, preencha o formulário de cadastro
          bancário clicando no botão <b>"Primeiro Acesso"</b> logo abaixo. Sem essa etapa, o pagamento
          não poderá ser creditado em sua conta, mesmo após a aprovação.
        </p>

        <div className="buttons">
          <button className="btn-outline" onClick={handlePrimeiroAcesso}>
            <UserPlus size={18} />
            Primeiro Acesso
          </button>

          <button
            className="btn-primary"
            onClick={() => navigate("/formulario")}
          >
            Já tenho cadastro
            <ArrowRight size={18} />
          </button>
        </div>
      </main>

      {showModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Instruções para primeiro acesso"
          onClick={(e) => {
            if (e.target.classList.contains("modal-overlay")) setShowModal(false);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>Primeiro Acesso - Como preencher</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            <div className="modal-body">
              <p className="lead">
                Leia com atenção e preencha tudo corretamente para evitar recusas ou atrasos no pagamento.
              </p>

              <ol className="steps">
                <li>No formulário, localize e marque a opção <strong>"Somente para Reembolso de Viagens"</strong>.</li>
                <li>Na pergunta <strong>"Informe o tipo da conta"</strong>, selecione <strong>Conta Corrente</strong>.</li>
                <li>A conta corrente informada deve estar no nome da pessoa que está solicitando o reembolso. Se o titular for diferente, o pagamento será recusado.</li>
                <li>Anexe comprovante de titularidade (extrato ou comprovante bancário) legível e atualizado.</li>
                <li>Revise todos os campos antes de enviar — dados inconsistentes causam bloqueio do pagamento.</li>
              </ol>

              <h4>Observações importantes</h4>
              <ul className="observations">
                <li>Selecione <strong>"Somente para Reembolso de Viagens"</strong>.</li>
                <li>Conta Corrente deve obrigatoriamente ser no nome do solicitante. Contas de terceiros não serão aceitas.</li>
                <li>Comprovantes ilegíveis ou com dados incompletos serão recusados.</li>
                <li>Em caso de dúvida, entre em contato com o suporte antes de enviar.</li>
              </ul>
            </div>

            <footer className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Fechar
              </button>
              <button className="btn-primary modal-open" onClick={openForm}>
                Ir para o formulário <ArrowRight size={16} />
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
