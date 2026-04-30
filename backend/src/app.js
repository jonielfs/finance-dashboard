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

app.use(cors({
  origin: "*"
}));

app.use(helmet());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Acesso permitido",
    userId: req.userId,
  });
});

app.use("/cards", cardRoutes);

app.use("/invoices", invoiceRoutes);

app.use("/purchases", purchaseRoutes);

app.use("/dashboard", dashboardRoutes);

app.use("/goal", goalRoutes);

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});