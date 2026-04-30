import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Header from "../components/Header";
import { formatMoney } from "../utils/format";

export default function Goal({ onLogout, setPage, page }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [error, setError] = useState("");

  // 🔹 carregar meta atual
  const loadGoal = async () => {
    try {
      const data = await apiFetch("/goal");

      if (data) {
        setCurrentGoal(data.value);
        setValue(data.value);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar meta");
    }
  };

  useEffect(() => {
    loadGoal();
  }, []);

  // 💾 salvar meta
  const handleSave = async () => {
    setError("");

    if (!value || Number(value) <= 0) {
      setError("Informe um valor válido");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/goal", {
        method: "POST",
        body: JSON.stringify({
          value: Number(value),
        }),
      });

      await loadGoal();

    } catch (err) {
      console.error(err);
      setError("Erro ao salvar meta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Header
        title="Meta"
        onLogout={onLogout}
        onNavigate={setPage}
        page={page}
      />

      <div style={styles.card}>
        <h3>Meta mensal</h3>

        {currentGoal !== null && (
          <p style={styles.current}>
            Atual: {formatMoney(currentGoal)}
          </p>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.formRow}>
          <input
            style={styles.input}
            type="number"
            placeholder="Valor da meta"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <button
            style={styles.button}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
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
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    maxWidth: "500px",
  },

  formRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  button: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  current: {
    marginBottom: "10px",
    color: "#6b7280",
  },

  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "8px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "10px",
  },
};