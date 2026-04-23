import React, { useEffect, useState } from "react";
import "./Gestao.css";
import { CheckCircle, Clock, XCircle, X } from "lucide-react";
import logo from "../assets/logo.png";
import { useMemo } from "react";

export default function Gestao() {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState("Todos");
    const [busca, setBusca] = useState("");
    const [buscaDebounce, setBuscaDebounce] = useState("");

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);

            const res = await fetch("http://localhost:3001/solicitacoes");

            if (!res.ok) throw new Error("Erro ao buscar dados");

            const data = await res.json();
            setDados(data);

        } catch (err) {
            console.error(err);
            setError("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            setBuscaDebounce(busca);
        }, 300);

        return () => clearTimeout(timeout);
    }, [busca]);

    // NORMALIZAÇÃO
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

        if (status === "Aprovado") return "status aprovado";
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

    // FILTRO INTELIGENTE (SEM RELOAD)
    const dadosFiltrados = useMemo(() => {
        return dados.filter((item) => {
            const status = normalizarStatus(item.status);

            const matchStatus =
                filtroStatus === "Todos" || status === filtroStatus;

            const texto = buscaDebounce.toLowerCase();

            const matchBusca =
                item.nome?.toLowerCase().includes(texto) ||
                String(item.id).includes(texto) ||
                (item.despesas || []).some((d) =>
                    d.descricao?.toLowerCase().includes(texto)
                );

            return matchStatus && matchBusca;
        });
    }, [dados, filtroStatus, buscaDebounce]);

    // KPIs
    const analise = dados.filter(
        (d) => normalizarStatus(d.status) === "Em análise"
    ).length;

    const aprovados = dados.filter(
        (d) => normalizarStatus(d.status) === "Aprovado"
    ).length;

    const concluido = dados.filter(
        (d) => normalizarStatus(d.status) === "Concluído"
    ).length;

    const recusado = dados.filter(
        (d) => normalizarStatus(d.status) === "Recusado"
    ).length;

    // ATUALIZA STATUS
    const atualizarStatus = async (id, novoStatus) => {
        const confirmar = window.confirm(
            novoStatus === 2
                ? "Deseja realmente APROVAR essa solicitação?"
                : "Deseja realmente RECUSAR essa solicitação?"
        );

        if (!confirmar) return;

        try {
            setUpdatingId(id);

            const res = await fetch(
                `http://localhost:3001/solicitacoes/${id}/status`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_status: novoStatus }),
                }
            );

            if (!res.ok) throw new Error("Erro ao atualizar");

            setDados((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            id_status: novoStatus,
                            status:
                                novoStatus === 2
                                    ? "Aprovado"
                                    : novoStatus === 4
                                        ? "Recusado"
                                        : item.status,
                        }
                        : item
                )
            );
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar status");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return <div className="container">Carregando...</div>;
    if (error) return <div className="container">{error}</div>;

    const contagem = {
        "Todos": dados.length,
        "Em análise": analise,
        "Aprovado": aprovados,
        "Recusado": recusado,
        "Concluído": concluido,
    };

    return (
        <div className="container fade-in">
            {/* HEADER */}
            <header className="header-custom">
                <div className="header-left">
                    <img src={logo} alt="Logo" />
                    <div>
                        <h2>Painel do Gestor</h2>
                        <span>Aprove ou recuse solicitações</span>
                    </div>
                </div>
            </header>

            {/* KPIs */}
            <div className="resumo">

                <div className="resumo-card kpi-analise">
                    <span>Em análise</span>
                    <h3>{analise}</h3>
                </div>

                <div className="resumo-card kpi-aprovado">
                    <span>Aprovado</span>
                    <h3>{aprovados}</h3>
                </div>

                <div className="resumo-card kpi-concluido">
                    <span>Concluído</span>
                    <h3>{concluido}</h3>
                </div>

                <div className="resumo-card kpi-recusado">
                    <span>Recusado</span>
                    <h3>{recusado}</h3>
                </div>

            </div>

            {/* FILTROS */}
            <div className="filtros-container">
                <input
                    type="text"
                    placeholder="Buscar por nome, ID ou descrição..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="input-busca"
                />

                <div className="filtros">
                    {["Todos", "Em análise", "Aprovado", "Recusado", "Concluído"].map((f) => (
                        <button
                            key={f}
                            className={`filtro-btn ${filtroStatus === f ? "ativo" : ""}`}
                            onClick={() => setFiltroStatus(f)}
                        >
                            {f} ({contagem[f]})
                        </button>
                    ))}
                </div>
            </div>

            {/* LISTA EM TABELA */}
            <div className="tabela-container">
                <table className="tabela">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Colaborador</th>
                            <th>Categoria</th>
                            <th>Descrição</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {dadosFiltrados.map((item) => {
                            const status = normalizarStatus(item.status);

                            const totalValor = (item.despesas || []).reduce(
                                (acc, d) => acc + Number(d.valor_calculado || 0),
                                0
                            );

                            const primeiraDespesa =
                                item.despesas && item.despesas.length > 0
                                    ? item.despesas[0]
                                    : null;

                            const bloqueado = item.id_status !== 1;

                            return (
                                <tr key={item.id}>
                                    <td className="td-id">
                                        REQ-{String(item.id).padStart(3, "0")}
                                    </td>

                                    <td>
                                        <div className="colaborador">
                                            <strong>{item.nome}</strong>
                                        </div>
                                    </td>

                                    <td>{primeiraDespesa?.categoria || "-"}</td>

                                    <td className="descricao">
                                        {primeiraDespesa?.descricao || "-"}
                                    </td>

                                    <td className="valor">
                                        R$ {totalValor.toFixed(2)}
                                    </td>

                                    <td>
                                        <div className={getStatusClass(status) + " badge"}>
                                            {getIcon(status)}
                                            <span>{status}</span>
                                        </div>
                                    </td>

                                    <td>
                                        {item.data_criacao
                                            ? new Date(item.data_criacao).toLocaleDateString()
                                            : "-"}
                                    </td>

                                    <td className="acoes">
                                        <button
                                            className="btn-aprovar"
                                            disabled={bloqueado || updatingId === item.id}
                                            onClick={() => atualizarStatus(item.id, 2)}
                                        >
                                            Aprovar
                                        </button>

                                        <button
                                            className="btn-recusar"
                                            disabled={bloqueado || updatingId === item.id}
                                            onClick={() => atualizarStatus(item.id, 4)}
                                        >
                                            Recusar
                                        </button>

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

            {/* MODAL */}
            {selected && (
                <div className="modal-overlay" onMouseDown={() => setSelected(null)}>
                    <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                REQ-{String(selected.id).padStart(3, "0")} —{" "}
                                {selected.nome}
                            </h3>

                            <button
                                className="close-btn"
                                onClick={() => setSelected(null)}
                            >
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
        </div>
    );
}