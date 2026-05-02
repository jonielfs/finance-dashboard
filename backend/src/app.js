require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middlewares/authMiddleware");

const cardRoutes = require("./routes/cardRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const goalRoutes = require("./routes/goalRoutes");

const app = express();

app.set("trust proxy", 1);

// 🔐 Segurança
app.use(helmet());

// 🌐 CORS configurado corretamente
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    console.log("Origin recebido:", origin);

    // permite requests sem origin (Postman, mobile)
    if (!origin) return callback(null, true);

    // permite explicitamente configurados + localhost (dev)
    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// 📦 Body parser
app.use(express.json());

// 🔓 Rotas públicas
app.use("/auth", authRoutes);

// 🔒 Rotas protegidas
app.use("/cards", cardRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/goal", goalRoutes);

// 🔐 Rota de teste protegida
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Acesso permitido",
    userId: req.userId,
  });
});

// 🩺 Health check
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// 🚨 Tratamento global de erro (boa prática)
app.use((err, req, res, next) => {
  console.error(err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS bloqueado" });
  }

  return res.status(500).json({ message: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});