import React, { useState, useRef } from "react";
import "./Formulario.css";
import { User, FileText, Upload, Check, Trash, Info } from "lucide-react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

import { useForm, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// VALIDADOR CPF
const cpfValido = (cpf) => {
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== Number(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;

    return resto === Number(cpf[10]);
};

// SCHEMA
const schema = z.object({
    nome: z.string().min(3, "Nome obrigatório"),

    cpf: z
        .string()
        .min(1, "CPF é obrigatório")
        .min(11, "Digite o CPF completo")
        .refine((cpf) => cpfValido(cpf), {
            message: "CPF inválido",
        }),

    telefone: z
        .string()
        .min(1, "Telefone é obrigatório")
        .min(10, "Telefone inválido"),
    area: z.string().min(2, "Área obrigatória"),
    cargo: z.string().min(2, "Cargo obrigatório"),
    localNegocio: z.string().min(2, "Local de Negócio obrigatório"),
    regional: z.string().min(2, "Regional obrigatória"),
    centroCusto: z.string().min(2, "Centro de Custo obrigatório"),
});

export default function Formulario() {
    const [step, setStep] = useState(1);
    const fileInputRef = useRef(null);

    //  estado correto (APENAS UMA VEZ)
    const [despesas, setDespesas] = useState([
        {
            categoria: "",
            data: "",
            valor: "",
            descricao: "",
            file: null,
            fileName: "",
        },
    ]);

    const {
        register,
        handleSubmit,
        control,
        getValues,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        mode: "onBlur",
        defaultValues: {
            cpf: "",
            telefone: "",
        },
    });

    const onSubmit = () => setStep(2);
    const handleEnviar = async () => {
        try {
            if (!validarDespesas()) {
                alert("Preencha todos os campos corretamente!");
                return;
            }

            const dados = {
                ...getValues(),
                despesas
            };

            const response = await fetch("http://localhost:3001/reembolso", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dados),
            });

            if (!response.ok) {
                throw new Error("Erro ao enviar");
            }

            setStep(3);

        } catch (error) {
            console.error(error);
            alert("Erro ao enviar dados!");
        }
    };

    // adicionar nova despesa
    const adicionarDespesa = () => {
        setDespesas([
            ...despesas,
            {
                categoria: "",
                data: "",
                valor: "",
                descricao: "",
                file: null,
                fileName: "",
            },
        ]);
    };

    // atualizar campos
    const atualizarDespesa = (index, campo, valor) => {
        const novas = [...despesas];
        novas[index][campo] = valor;
        setDespesas(novas);
    };

    // remover despesa
    const removerDespesa = (index) => {
        const novas = despesas.filter((_, i) => i !== index);
        setDespesas(novas);
    };

    // remover arquivo de uma despesa
    const removerArquivo = (index) => {
        const novas = [...despesas];
        novas[index].file = null;
        novas[index].fileName = "";
        setDespesas(novas);
    };

    const validarDespesas = () => {
        for (let despesa of despesas) {
            if (
                !despesa.categoria ||
                despesa.categoria === "Selecione a categoria" ||
                !despesa.data ||
                !despesa.valor ||
                !despesa.descricao ||
                !despesa.file
            ) {
                return false;
            }
        }
        return true;
    };

    return (
        <div className="container fade-in">
            {/* HEADER */}
            <header className="header">
                <Link to="/" className="logo">
                    <img src={logo} alt="Logo" />
                    <div>
                        <h3>Portal de Reembolso</h3>
                        <span>Solicite e acompanhe seus reembolsos</span>
                    </div>
                </Link>
            </header>

            {/* STEPPER */}
            <div className="stepper">
                <div className={`step ${step === 1 ? "active" : "done"}`}>
                    <div className="circle">
                        {step > 1 ? <Check size={14} /> : "1"}
                    </div>
                    <span>Dados Pessoais</span>
                </div>

                <div className={`line ${step > 1 ? "active-line" : ""}`}></div>

                <div className={`step ${step === 2 ? "active" : step > 2 ? "done" : ""}`}>
                    <div className="circle">
                        {step > 2 ? <Check size={14} /> : "2"}
                    </div>
                    <span>Solicitação e Comprovantes</span>
                </div>
            </div>

            <div className="card">

                {/* STEP 1 */}
                {step === 1 && (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="card-header">
                            <div className="icon-box">
                                <User size={18} />
                            </div>
                            <div>
                                <h2>Dados Pessoais</h2>
                                <span>Informe seus dados para a solicitação</span>
                            </div>
                        </div>

                        <div className="form-grid">
                            {/* Nome Completo */}
                            <div>
                                <label>Nome completo</label>
                                <input {...register("nome")} placeholder="Digite seu nome completo" />
                                {errors.nome && <span className="error">{errors.nome.message}</span>}
                            </div>

                            {/* CPF */}
                            <div>
                                <label>CPF</label>
                                <Controller
                                    name="cpf"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            format="###.###.###-##"
                                            placeholder="Digite apenas números"
                                            className="input"
                                            value={field.value || ""}
                                            onValueChange={(values) => field.onChange(values.value)}
                                        />
                                    )}
                                />
                                {errors.cpf && <span className="error">{errors.cpf.message}</span>}
                            </div>

                            {/* TELEFONE */}
                            <div className="full">
                                <label>Telefone</label>
                                <Controller
                                    name="telefone"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            format="(##) #####-####"
                                            placeholder="Digite apenas números"
                                            className="input"
                                            value={field.value || ""}
                                            onValueChange={(values) => field.onChange(values.value)}
                                        />
                                    )}
                                />
                                {errors.telefone && (
                                    <span className="error">{errors.telefone.message}</span>
                                )}
                            </div>

                            <div>
                                <label>Área</label>
                                <input {...register("area")} placeholder="Ex: BPO" />
                                {errors.area && <span className="error">{errors.area.message}</span>}
                            </div>

                            <div>
                                <label>Cargo</label>
                                <input {...register("cargo")} placeholder="Ex: Analista, Coordenador" />
                                {errors.cargo && <span className="error">{errors.cargo.message}</span>}
                            </div>

                            {/* LOCAL DE NEGÓCIO */}
                            <div>
                                <label>Local de Negócio</label>
                                <input
                                    {...register("localNegocio")}
                                    placeholder="Ex: 11H1"
                                />
                                {errors.localNegocio && (
                                    <span className="error">{errors.localNegocio.message}</span>
                                )}
                            </div>

                            {/* REGIONAL */}
                            <div>
                                <label>Regional</label>
                                <input
                                    {...register("regional")}
                                    placeholder="Ex: SP Interior"
                                />
                                {errors.regional && (
                                    <span className="error">{errors.regional.message}</span>
                                )}
                            </div>

                            {/* CENTRO DE CUSTO */}
                            <div className="full">
                                <label>Centro de Custo</label>
                                <input
                                    {...register("centroCusto")}
                                    placeholder="Ex: 85SPSP8H71"
                                />
                                {errors.centroCusto && (
                                    <span className="error">{errors.centroCusto.message}</span>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="btn-primary full-btn">
                            Salvar e continuar
                        </button>
                    </form>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <>
                        <div className="card-header">
                            <div className="icon-box">
                                <FileText size={18} />
                            </div>
                            <div>
                                <h2>Solicitação de Reembolso</h2>
                                <span>Preencha os dados e anexe os comprovantes</span>
                            </div>
                        </div>

                        <div className="form-grid">
                            {despesas.map((despesa, index) => {

                                const isCombustivel = despesa.categoria === "Combustível";
                                const isRefeicao = despesa.categoria === "Refeição";

                                const valorCalculado = isCombustivel
                                    ? (Number(despesa.valor || 0) * 0.99).toFixed(2)
                                    : despesa.valor;

                                return (
                                    <div
                                        key={index}
                                        className="full"
                                        style={{
                                            borderBottom: "1px solid #eee",
                                            paddingBottom: 20,
                                            marginBottom: 20,
                                            position: "relative",
                                        }}
                                    >
                                        <h4>Despesa {index + 1}</h4>
                                        <br />
                                        {/* CATEGORIA */}
                                        <div className="full">
                                            <label>Categoria</label>
                                            <select
                                                value={despesa.categoria}
                                                onChange={(e) =>
                                                    atualizarDespesa(index, "categoria", e.target.value)
                                                }
                                            >
                                                <option>Selecione a categoria</option>
                                                <option>Combustível</option>
                                                <option>Estacionamento</option>
                                                <option>Pedágio</option>
                                                <option>Refeição</option>
                                                <option>Uber</option>
                                            </select>
                                        </div>

                                        {/* ALERTA DINÂMICO */}
                                        {despesa.categoria === "Combustível" && (
                                            <div className="alert-box">
                                                <Info size={16} className="alert-icon" />
                                                <span>Informe o KM percorrido. Valor: KM x R$ 0,99</span>
                                            </div>
                                        )}

                                        {despesa.categoria === "Pedágio" && (
                                            <div className="alert-box">
                                                <Info size={16} className="alert-icon" />
                                                <span>O comprovante deve estar em nome do solicitante</span>
                                            </div>
                                        )}

                                        {despesa.categoria === "Uber" && (
                                            <div className="alert-box">
                                                <Info size={16} className="alert-icon" />
                                                <span>A solicitação deve estar em nome do solicitante</span>
                                            </div>
                                        )}

                                        {despesa.categoria === "Estacionamento" && (
                                            <div className="alert-box">
                                                <Info size={16} className="alert-icon" />
                                                <span>Anexar comprovante correspondente</span>
                                            </div>
                                        )}

                                        {despesa.categoria === "Refeição" && (
                                            <div className="alert-box">
                                                <Info size={16} className="alert-icon" />
                                                <span>Limite de R$ 80,00 por dia. Valor acima será considerado o limite</span>
                                            </div>
                                        )}
                                        <br />
                                        <div className="row">
                                            {/* DATA */}
                                            <div>
                                                <label>Data da despesa</label>
                                                <input
                                                    type="date"
                                                    value={despesa.data}
                                                    onChange={(e) =>
                                                        atualizarDespesa(index, "data", e.target.value)
                                                    }
                                                />
                                            </div>

                                            {/* VALOR OU KM */}
                                            <div>
                                                <label>
                                                    {isCombustivel ? "KM percorrido" : "Valor (R$)"}
                                                </label>

                                                <input
                                                    type="number"
                                                    placeholder={isCombustivel ? "Ex: 150" : "0,00"}
                                                    value={despesa.valor}
                                                    onChange={(e) => {
                                                        let value = e.target.value;

                                                        // REGRA REFEIÇÃO
                                                        if (isRefeicao && Number(value) > 80) {
                                                            value = 80;
                                                        }

                                                        atualizarDespesa(index, "valor", value);
                                                    }}
                                                />

                                                {/* VALOR CALCULADO */}
                                                {isCombustivel && (
                                                    <small style={{ color: "#e30613" }}>
                                                        Valor calculado: R$ {valorCalculado}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                        <br />
                                        {/* DESCRIÇÃO */}
                                        <div className="full">
                                            <label>Descrição / Justificativa</label>
                                            <textarea
                                                placeholder="Descreva brevemente o motivo"
                                                value={despesa.descricao}
                                                onChange={(e) =>
                                                    atualizarDespesa(index, "descricao", e.target.value)
                                                }
                                            />
                                        </div>
                                        <br />
                                        {/* UPLOAD */}
                                        <div className="full upload-box">
                                            <Upload size={20} />
                                            <p>Clique para selecionar arquivos</p>
                                            <span>PDF, JPG ou PNG — máx. 10MB</span>

                                            {despesa.fileName && (
                                                <div className="file-preview">
                                                    <span>{despesa.fileName}</span>
                                                    <button
                                                        type="button"
                                                        className="remove-file"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removerArquivo(index);
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        atualizarDespesa(index, "file", file);
                                                        atualizarDespesa(
                                                            index,
                                                            "fileName",
                                                            `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* REMOVER */}
                                        {despesas.length > 1 && (
                                            <button
                                                type="button"
                                                className="delete-btn"
                                                onClick={() => removerDespesa(index)}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* BOTÃO ADICIONAR */}
                        <button
                            type="button"
                            onClick={adicionarDespesa}
                            className="add-despesa-btn"
                        >
                            + Adicionar outra despesa
                        </button>

                        {/* AÇÕES */}
                        <div className="actions">
                            <button
                                className="btn-outline"
                                type="button"
                                onClick={() => setStep(1)}
                            >
                                Voltar
                            </button>

                            <button
                                className="btn-primary"
                                onClick={() => {
                                    if (!validarDespesas()) {
                                        alert("Preencha todos os campos corretamente!");
                                        return;
                                    }
                                    handleEnviar();
                                }}
                            >
                                Enviar solicitação
                            </button>
                        </div>
                    </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>

                        {/* Ícone */}
                        <div
                            style={{
                                background: "#fdecee",
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                            }}
                        >
                            <Check size={30} color="#e30613" />
                        </div>

                        {/* Título */}
                        <h2 style={{ marginBottom: 10 }}>Solicitação enviada!</h2>

                        {/* Descrição */}
                        <p
                            style={{
                                color: "#666",
                                maxWidth: 400,
                                margin: "10px auto 30px",
                                lineHeight: "1.5",
                            }}
                        >
                            Seu pedido de reembolso foi registrado com sucesso.
                            Acompanhe o status da sua solicitação diretamente no portal.
                        </p>

                        {/* Botão para o portal */}
                        <Link
                            to="/solicitacoes"
                            style={{
                                display: "inline-block",
                                background: "#e30613",
                                color: "#fff",
                                padding: "12px 24px",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontWeight: "600",
                                transition: "0.2s",
                            }}
                            onMouseOver={(e) => (e.target.style.background = "#c00510")}
                            onMouseOut={(e) => (e.target.style.background = "#e30613")}
                        >
                            Acompanhar solicitação
                        </Link>

                    </div>
                )}
            </div>
        </div >
    );
}