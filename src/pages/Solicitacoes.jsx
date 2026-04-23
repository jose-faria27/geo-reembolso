import React, { useEffect, useState } from "react";
import "./Solicitacoes.css";
import { CheckCircle, Clock, XCircle, X, HelpCircle } from "lucide-react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

export default function Solicitacoes() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [infoOpen, setInfoOpen] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:3001/solicitacoes");
        if (!res.ok) throw new Error(`Erro: ${res.status}`);
        const data = await res.json();
        setDados(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as solicitações.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const normalizarStatus = (status) => {
    if (!status) return "Em análise";

    const s = status.toLowerCase();

    if (s.includes("aprovado")) return "Aprovado";
    if (s.includes("recusado")) return "Recusado";
    if (s.includes("conclu")) return "Concluído";

    return "Em análise";
  };

  const getStatusClass = (status) => {
    status = normalizarStatus(status);
    if (status === "Aprovado") return "status aprovado pelo Gestor";
    if (status === "Recusado") return "status recusado";
    if (status === "Concluído") return "status concluido";
    return "status analise";
  };

  const getIcon = (status) => {
    status = normalizarStatus(status);
    if (status === "Aprovado") return <CheckCircle size={14} />;
    if (status === "Recusado") return <XCircle size={14} />;
    if (status === "Concluído") return <CheckCircle size={14} />;
    return <Clock size={14} />;
  };

  // CONTADORES
  const analise = dados.filter((d) => normalizarStatus(d.status) === "Em análise").length;
  const aprovados = dados.filter((d) => normalizarStatus(d.status) === "Aprovado").length;
  const concluido = dados.filter((d) => normalizarStatus(d.status) === "Concluído").length;
  const recusado = dados.filter((d) => normalizarStatus(d.status) === "Recusado").length;

  if (loading) return <div className="container">Carregando...</div>;
  if (error) return <div className="container">Erro: {error}</div>;

  const abrirModal = (item) => setSelected(item);
  const fecharModal = () => setSelected(null);

  const abrirInfo = (tipo) => setInfoOpen(tipo);
  const fecharInfo = () => setInfoOpen(null);

  const textos = {
    analise: "Em análise: Solicitação enviada e aguardando aprovação do gestor.",
    aprovado: "Aprovado: Aprovado pelo gestor e enviado ao SAP, aguardando processamento.",
    concluido: "Concluído: Sua solicitação foi concluída e aprovada pelo SAP.",
    recusado: "Recusado: Sua solicitação foi recusada."
  };


  return (
    <div className="container fade-in">
      {/* HEADER */}
      <header className="header-custom">
        <div className="header-left">
          <img src={logo} alt="Logo" />
          <div>
            <h2>Minhas Solicitações</h2>
            <span>Acompanhe seus pedidos de reembolso</span>
          </div>
        </div>

        <Link to="/" className="btn-static">
          + Nova Solicitação
        </Link>
      </header>

      <div className="resumo">
        <div className="resumo-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>{analise}</h3>
            <HelpCircle size={15} onClick={() => abrirInfo("analise")} style={{ cursor: "pointer" }} />
          </div>
          <span>Em análise</span>
        </div>

        <div className="resumo-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>{aprovados}</h3>
            <HelpCircle size={15} onClick={() => abrirInfo("aprovado")} style={{ cursor: "pointer" }} />
          </div>
          <span>Aprovado</span>
        </div>

        <div className="resumo-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>{concluido}</h3>
            <HelpCircle size={15} onClick={() => abrirInfo("concluido")} style={{ cursor: "pointer" }} />
          </div>
          <span>Concluído</span>
        </div>

        <div className="resumo-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>{recusado}</h3>
            <HelpCircle size={15} onClick={() => abrirInfo("recusado")} style={{ cursor: "pointer" }} />
          </div>
          <span>Recusado</span>
        </div>
      </div>

      {/* TABELA */}
      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th>ID</th>
              <th>Colaborador</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item) => {
              const status = normalizarStatus(item.status);

              const totalValor = (item.despesas || []).reduce(
                (acc, d) => acc + Number(d.valor_calculado || 0),
                0
              );

              const primeiraDespesa =
                item.despesas?.length > 0 ? item.despesas[0] : null;

              return (
                <tr key={item.id}>
                  {/* ID */}
                  <td className="td-id">
                    REQ-{String(item.id).padStart(3, "0")}
                  </td>

                  {/* COLABORADOR */}
                  <td>
                    <div className="colaborador">
                      <strong>{item.nome}</strong>
                    </div>
                  </td>

                  {/* DESCRIÇÃO */}
                  <td className="descricao">
                    {primeiraDespesa?.descricao || "-"}
                  </td>

                  {/* VALOR */}
                  <td className="valor">
                    R$ {totalValor.toFixed(2)}
                  </td>

                  {/* STATUS */}
                  <td>
                    <div className={getStatusClass(status) + " badge"}>
                      {getIcon(status)}
                      <span>{status}</span>
                    </div>
                  </td>

                  {/* DATA */}
                  <td>
                    {item.data_criacao
                      ? new Date(item.data_criacao).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* AÇÃO */}
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => setSelected(item)}
                    >
                      Ver mais
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALHADO */}
      {selected && (
        <div className="modal-overlay" onMouseDown={fecharModal}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>REQ-{String(selected.id).padStart(3, "0")} — {selected.nome}</h3>
                <div className={getStatusClass(selected.status) + " badge"}>
                  {getIcon(selected.status)}
                  <span className="badge-text">{normalizarStatus(selected.status)}</span>
                </div>
              </div>
              <button className="close-btn" onClick={fecharModal} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <section className="grid-2">
                <div className="box">
                  <h4>Dados do solicitante</h4>
                  <div><strong>Nome:</strong> {selected.nome}</div>
                  <div><strong>CPF:</strong> {selected.cpf}</div>
                  <div><strong>Telefone:</strong> {selected.telefone}</div>
                  <div><strong>Área:</strong> {selected.area}</div>
                  <div><strong>Cargo:</strong> {selected.cargo}</div>
                  <div><strong>Local:</strong> {selected.local_negocio}</div>
                  <div><strong>Regional:</strong> {selected.regional}</div>
                  <div><strong>Centro de Custo:</strong> {selected.centro_custo}</div>
                  <div><strong>Data criação:</strong> {new Date(selected.data_criacao).toLocaleString()}</div>
                </div>

                <div className="box">
                  <h4>Resumo financeiro</h4>
                  <div className="valor-grande">R$ {(selected.despesas || []).reduce((acc, d) => acc + Number(d.valor_calculado || 0), 0).toFixed(2)}</div>
                  <h5 style={{ marginTop: 12 }}>Despesas</h5>
                  <div className="despesas-modal">
                    {(selected.despesas || []).length === 0 && <div>Nenhuma despesa</div>}
                    {(selected.despesas || []).map((d) => (
                      <div key={d.id} className="despesa-line">
                        <div className="desp-cat">{d.categoria}</div>
                        <div className="desp-desc">{d.descricao || "-"}</div>
                        <div className="desp-values">
                          <div>{d.data ? new Date(d.data).toLocaleDateString() : "-"}</div>
                          <div>{d.valor_calculado !== null && d.valor_calculado !== undefined ? `R$ ${Number(d.valor_calculado).toFixed(2)}` : "-"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INFO (NOVO) */}
      {infoOpen && (
        <div className="modal-overlay" onMouseDown={fecharInfo}>
          <div className="modal-info" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-info-header">
              <h3>Sobre o status</h3>
              <button className="close-btn" onClick={fecharInfo}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-info-body">
              <p>{textos[infoOpen]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}