import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Header from "../components/Header";

export default function Invoices({ onLogout, setPage, page }) {
  const [invoices, setInvoices] = useState([]);
  const [cards, setCards] = useState([]);

  const [cardId, setCardId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [referenceDate, setReferenceDate] = useState("");

  const [filterYear, setFilterYear] = useState("");
  const [filterCard, setFilterCard] = useState("");

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editStatus, setEditStatus] = useState("OPEN");

  const [suggested, setSuggested] = useState(null);
  const [error, setError] = useState("");

  const months = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Fev" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Abr" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Ago" },
    { value: "09", label: "Set" },
    { value: "10", label: "Out" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dez" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  const formatMoney = (value) =>
    Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatMonth = (dateStr) => {
    const date = new Date(dateStr);
    const m = months[date.getMonth()];
    return `${m.label}/${date.getFullYear()}`;
  };

  const statusColor = {
    OPEN: "#2563eb",
    CLOSED: "#16a34a",
    PAID: "#6b7280",
  };

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      setReferenceDate(`${selectedYear}-${selectedMonth}`);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const now = new Date();
    setSelectedMonth(String(now.getMonth() + 1).padStart(2, "0"));
    setSelectedYear(String(now.getFullYear()));
  }, []);

  const handleCurrencyChange = (value, setter) => {
    let v = value.replace(/\D/g, "");
    const number = Number(v) / 100;

    const formatted = number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setter(formatted);
  };

  const parseCurrency = (value) =>
    Number(value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());

  const loadInvoices = async () => {
    setLoading(true);
    const data = await apiFetch("/invoices");
    setInvoices(data);
    setLoading(false);
  };

  const loadCards = async () => {
    const data = await apiFetch("/cards");
    setCards(data);
  };

  useEffect(() => {
    loadInvoices();
    loadCards();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const date = new Date(inv.referenceDate);
    return (
      (!filterYear || date.getFullYear() === Number(filterYear)) &&
      (!filterCard || inv.cardId === Number(filterCard))
    );
  });

  const handleCreate = async () => {
    setError("");

    if (!cardId || !referenceDate || !totalAmount) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      await apiFetch("/invoices", {
        method: "POST",
        body: JSON.stringify({
          cardId: Number(cardId),
          referenceDate,
          totalAmount: parseCurrency(totalAmount),
        }),
      });

      setTotalAmount("");
      loadInvoices();
    } catch {
      setError("Erro ao criar fatura");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deseja deletar?")) return;

    setDeletingId(id);

    try {
      await apiFetch(`/invoices/${id}`, { method: "DELETE" });
      loadInvoices();
    } catch {
      setError("Erro ao deletar fatura");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (inv) => {
    setEditingId(inv.id);
    setEditValue(formatMoney(inv.totalAmount));
    setEditStatus(inv.status);
  };

  const handleSave = async (id) => {
    try {
      await apiFetch(`/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          totalAmount: parseCurrency(editValue),
          status: editStatus,
        }),
      });

      setEditingId(null);
      loadInvoices();
    } catch {
      setError("Erro ao atualizar fatura");
    }
  };

  return (
    <div style={styles.container}>
      <Header title="Faturas" onLogout={onLogout} onNavigate={setPage} page={page} />

      {/* Nova fatura */}
      <div style={styles.card}>
        <h3>Nova fatura</h3>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.formGrid}>
          <select style={styles.input} value={cardId} onChange={(e) => setCardId(e.target.value)}>
            <option value="">Cartão</option>
            {cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select style={styles.inputSmall} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          <select style={styles.inputSmall} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>

          <input
            style={styles.input}
            placeholder="Valor (R$)"
            value={totalAmount}
            onChange={(e) => handleCurrencyChange(e.target.value, setTotalAmount)}
          />

          <button style={styles.primaryButton} onClick={handleCreate}>
            Adicionar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.card}>
        <div style={styles.filterRow}>
          <select style={styles.input} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">Todos os anos</option>
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>

          <select style={styles.input} value={filterCard} onChange={(e) => setFilterCard(e.target.value)}>
            <option value="">Todos os cartões</option>
            {cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <button style={styles.clearButton} onClick={() => {
            setFilterYear("");
            setFilterCard("");
          }}>
            Limpar
          </button>
        </div>
      </div>

      {/* Lista */}
      <div style={styles.card}>
        <h3>Minhas faturas</h3>

        <ul style={styles.list}>
          {filteredInvoices.map((inv) => (
            <li key={inv.id} style={styles.listItem}>
              {editingId === inv.id ? (
                <div style={styles.editRow}>
                  <input
                    style={styles.input}
                    value={editValue}
                    onChange={(e) => handleCurrencyChange(e.target.value, setEditValue)}
                  />

                  <select style={styles.input} value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="PAID">PAID</option>
                  </select>

                  <button style={styles.primaryButton} onClick={() => handleSave(inv.id)}>
                    Salvar
                  </button>

                  <button style={styles.clearButton} onClick={() => setEditingId(null)}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={styles.viewRow}>
                  <div>
                    <strong>
                      {formatMonth(inv.referenceDate)} •{" "}
                      {cards.find(c => c.id === inv.cardId)?.name || "Cartão"}
                    </strong>
                    <br />
                    {formatMoney(inv.totalAmount)} -{" "}
                    <span style={{ color: statusColor[inv.status] }}>
                      {inv.status}
                    </span>
                  </div>

                  <div style={styles.actions}>
                    <button style={styles.editButton} onClick={() => startEdit(inv)}>
                      Editar
                    </button>

                    <button style={styles.deleteButton} onClick={() => handleDelete(inv.id)}>
                      {deletingId === inv.id ? "..." : "Deletar"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", maxWidth: "1200px", margin: "0 auto" },

  card: { background: "#fff", padding: "16px", borderRadius: "12px", marginBottom: "20px" },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 0.8fr 1fr 1.5fr auto",
    gap: "10px",
    alignItems: "center",
    marginTop: "10px",
  },

  input: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd" },
  inputSmall: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd", textAlign: "center" },

  primaryButton: { background: "#3b82f6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px" },
  clearButton: { background: "#e5e7eb", border: "none", padding: "6px 10px", borderRadius: "6px" },

  filterRow: { display: "flex", gap: "10px" },

  list: { listStyle: "none", padding: 0 },
  listItem: { padding: "10px 0", borderBottom: "1px solid #eee" },

  viewRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  editRow: { display: "flex", gap: "10px", alignItems: "center" },

  actions: { display: "flex", gap: "8px" },

  editButton: { background: "#2563eb", color: "#fff", padding: "6px 10px", borderRadius: "6px" },
  deleteButton: { background: "#ef4444", color: "#fff", padding: "6px 10px", borderRadius: "6px" },

  error: { background: "#fee2e2", color: "#991b1b", padding: "8px", borderRadius: "6px", marginBottom: "10px" },
};