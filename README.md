# 💰 Finance Dashboard

Sistema de controle financeiro pessoal com foco em visualização de gastos, metas e acompanhamento de faturas de cartão.

---

## 🚀 Funcionalidades

* 📊 Dashboard com indicadores:

  * Gasto do mês
  * Média diária
  * Meta mensal
  * Parcelas futuras

* 💳 Gestão de cartões

* 🧾 Controle de faturas por mês

* 🎯 Definição de metas financeiras

* 🛒 Compras parceladas com geração automática de parcelas

* 📈 Gráfico com:

  * Totais mensais
  * Média móvel
  * Parcelas futuras
  * Linha de meta

* 🔐 Autenticação com JWT

* 🔑 Proteção de cadastro com chave (`REGISTER_KEY`)

---

## 🧱 Arquitetura

```
frontend/ → React (Vite)
backend/  → Node.js + Express
database/ → PostgreSQL (via Prisma)
```

---

## 🛠️ Stack

### Frontend

* React
* Vite
* Recharts

### Backend

* Node.js
* Express
* Prisma ORM

### Banco de dados

* PostgreSQL

---

## 📂 Estrutura do projeto

```
backend/
  src/
    controllers/
    routes/
    services/
    middlewares/
  prisma/

frontend/
  src/
    components/
    pages/
    services/
```

---

## ⚙️ Variáveis de ambiente

### Backend (`.env`)

```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
REGISTER_KEY=your_register_key
```

---

### Frontend (`.env`)

```
VITE_API_URL=http://localhost:3001
VITE_APP_VERSION=1.0.0
```

---

## ▶️ Como rodar localmente

### Backend

```
cd backend
npm install
npx prisma migrate dev
npm start
```

---

### Frontend

```
cd frontend
npm install
npm run dev
```

---

## 🌐 Deploy

* Frontend: Vercel
* Backend: Render
* Banco: Supabase

---

## 📊 Conceitos do sistema

* Os dados são baseados em **faturas mensais**
* Parcelas são projetadas para meses futuros
* A média exibida é uma **média móvel dos últimos meses**
* O dashboard utiliza o **último mês com dados cadastrados como o mês atual**

---

## 🔐 Segurança

* Autenticação via JWT
* Senhas criptografadas com bcrypt
* Rotas protegidas por middleware
* Chave de registro (`REGISTER_KEY`)

---

## 🚧 Melhorias futuras

* Filtro por período
* Linha de "comprometido" (gastos + parcelas)
* Importação de dados externos
* Dashboard mais avançado
* Testes automatizados

---

## 📌 Versão

Versão atual: **1.0.5**

---

## 👨‍💻 Autor

Joniel Fernandes

---

## 🚧 Em futuras atualizações

* Incrementar versão aqui, no package.json e na variável de ambiente do front
