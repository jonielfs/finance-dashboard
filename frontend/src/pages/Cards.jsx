import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Header from "../components/Header";

export default function Cards({ onLogout, setPage, page }) {
  const [cards, setCards] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 🔹 Carregar cartões
  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/cards");
      setCards(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar cartões");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // ➕ Criar cartão
  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Informe o nome do cartão");
      return;
    }

    try {
      await apiFetch("/cards", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      setName("");
      loadCards();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar cartão");
    }
  };

  // ❌ Deletar cartão
  const handleDelete = async (id) => {
    if (!confirm("Deseja realmente deletar este cartão?")) return;

    setDeletingId(id);

    try {
      await apiFetch(`/cards/${id}`, {
        method: "DELETE",
      });

      loadCards();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <Header title="Cartões" onLogout={ onLogout }
        onNavigate={ setPage } page={ page } />

      {/* Criar cartão */}
      <div style={styles.card}>
        <h3>Novo cartão</h3>

        <div style={styles.formRow}>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do cartão"
          />

          <button style={styles.button} onClick={handleCreate}>
            Adicionar
          </button>
        </div>
      </div>

      {/* Lista */}
      <div style={styles.card}>
        <h3>Meus cartões</h3>

        {loading ? (
          <p>Carregando...</p>
        ) : cards.length === 0 ? (
          <p>Nenhum cartão cadastrado</p>
        ) : (
          <ul style={styles.list}>
            {cards.map((card) => (
              <li key={card.id} style={styles.listItem}>
                <span>{card.name}</span>

                <button style={styles.deleteButton}
                  disabled={deletingId === card.id}
                  onClick={() => handleDelete(card.id)}
                >
                  {deletingId === card.id ? "Deletando..." : "Deletar"}
                </button>
              </li>
            ))}
          </ul>
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
  formRow: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};