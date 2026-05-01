import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Header from "../components/Header";
import { formatMoney, formatDate } from "../utils/format";

export default function Purchases({ onLogout, setPage, page }) {
  const [purchases, setPurchases] = useState([]);
  const [cards, setCards] = useState([]);

  const [form, setForm] = useState({
    description: "",
    totalAmount: "",
    installments: 1,
    cardId: "",
    purchaseDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 💰 máscara BRL
  const handleCurrencyChange = (value, setter) => {
    let v = value.replace(/\D/g, "");
    const number = Number(v) / 100;

    const formatted = number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setter(formatted);
  };

  // 💰 parse moeda
  const parseCurrency = (value) =>
    Number(
      value
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    );

  // 📅 máscara data
  const handleDateChange = (value) => {
    let v = value.replace(/\D/g, "");

    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, "$1/$2");
    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");

    setForm({ ...form, purchaseDate: v.slice(0, 10) });
  };

  // 📅 parse data
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();

    const [day, month, year] = dateStr.split("/");

    return new Date(`${year}-${month}-${day}T00:00:00`);
  };

  // 🔹 carregar dados
  const load = async () => {
    try {
      const [purchasesData, cardsData] = await Promise.all([
        apiFetch("/purchases"),
        apiFetch("/cards"),
      ]);

      setPurchases(purchasesData);
      setCards(cardsData);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ➕ criar compra
  const handleCreate = async () => {
    setError("");

    if (!form.description || !form.totalAmount || !form.installments || !form.cardId) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/purchases", {
        method: "POST",
        body: JSON.stringify({
          description: form.description,
          totalAmount: parseCurrency(form.totalAmount),
          installments: Number(form.installments),
          cardId: Number(form.cardId),
          purchaseDate: parseDate(form.purchaseDate),
        }),
      });

      setForm({
        description: "",
        totalAmount: "",
        installments: 1,
        cardId: "",
        purchaseDate: "",
      });

      await load();
    } catch (err) {
      console.error(err);
      setError("Erro ao criar compra");
    } finally {
      setLoading(false);
    }
  };

  // ❌ deletar
  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir esta compra?")) return;

    setError("");

    try {
      await apiFetch(`/purchases/${id}`, {
        method: "DELETE",
      });

      load();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erro ao deletar compra");
    }
  };

  return (
    <div style={styles.container}>
      <Header
        title="Compras"
        onLogout={onLogout}
        onNavigate={setPage}
        page={page}
      />

      {/* ➕ Nova compra */}
      <div style={styles.card}>
        <h3>Nova compra</h3>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.formGrid}>
          <input
            style={styles.input}
            placeholder="Descrição"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="Valor (R$)"
            value={form.totalAmount}
            onChange={(e) =>
              handleCurrencyChange(e.target.value, (val) =>
                setForm({ ...form, totalAmount: val })
              )
            }
          />

          <input
            style={styles.inputSmall}
            type="number"
            min="1"
            value={form.installments}
            onChange={(e) =>
              setForm({ ...form, installments: e.target.value })
            }
          />

          <select
            style={styles.input}
            value={form.cardId}
            onChange={(e) =>
              setForm({ ...form, cardId: e.target.value })
            }
          >
            <option value="">Cartão</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            placeholder="Data (dd/mm/aaaa)"
            value={form.purchaseDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />

          <button
            style={styles.primaryButton}
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </div>

      {/* 📋 Lista */}
      <div style={styles.card}>
        <h3>Minhas compras</h3>

        {purchases.length === 0 ? (
          <p style={styles.empty}>Nenhuma compra cadastrada</p>
        ) : (
          purchases.map((p) => (
            <div key={p.id} style={styles.purchaseItem}>
              <div>
                <div style={styles.title}>{p.description}</div>

                <div style={styles.meta}>
                  {formatMoney(p.totalAmount)} • {p.installments}x de{" "}
                  {formatMoney(p.totalAmount / p.installments)} • {" data referência parcela  "}
                  { formatDate(p.purchaseDate) }
                </div>
              </div>

              <button
                style={styles.deleteButton}
                onClick={() => handleDelete(p.id)}
              >
                Deletar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  card: {
    backgroundColor: "#fff",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 0.6fr 1fr 1.2fr auto",
    gap: "10px",
    alignItems: "center",
    marginTop: "10px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },

  inputSmall: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    textAlign: "center",
    fontSize: "14px",
  },

  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
  },

  purchaseItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #eee",
  },

  title: {
    fontWeight: "600",
    fontSize: "15px",
  },

  meta: {
    fontSize: "13px",
    color: "#6b7280",
  },

  deleteButton: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "8px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "10px",
  },

  empty: {
    color: "#6b7280",
    fontSize: "14px",
  },
};