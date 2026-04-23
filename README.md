# Sistema de Reembolso

Sistema web para gerenciamento de solicitações de reembolso, permitindo que colaboradores enviem pedidos e gestores realizem a aprovação ou reprovação de forma centralizada.

---

## Sobre o Projeto

O Sistema de Reembolso foi desenvolvido com o objetivo de digitalizar e otimizar o processo de solicitação e gestão de reembolsos.

A aplicação permite:
- Registro de solicitações de reembolso
- Acompanhamento do status dos pedidos
- Aprovação e reprovação por gestores

---

##  Funcionalidades

###  Colaborador
- Enviar solicitações de reembolso  
- Acompanhar status (Em analise, Aprovado, Reprovado)  

###  Gestão
- Visualizar solicitações  
- Aprovar ou reprovar pedidos  

---

##  Telas do Sistema

- **Home** → Página inicial  
- **Formulário** → Envio de solicitação  
- **Solicitações** → Consulta de pedidos  
- **Gestão** → Painel administrativo  

---

##  Tecnologias Utilizadas

- React  
- Node.js  
- Banco de Dados: PostgreSQL

---

##  Rotas da Aplicação

```jsx
<Route path="/" element={<Home />} />
<Route path="/formulario" element={<Formulario />} />
<Route path="/solicitacoes" element={<Solicitacoes />} />
<Route path="/gestao" element={<Gestao />} />
```

##  Como Executar o Projeto

Primeiro inicie o server.js (Backend)
```jsx
cd reembolso/backend
node server.js
```

Segundo inicie o projeto (Frontend)
```jsx
cd reembolso
npm install
npm start
```
