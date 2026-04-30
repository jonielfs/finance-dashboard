import { useState } from "react";

import { apiFetch } from "../services/api";

export default function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Preencha email e senha");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/";
      } else {
        setError("Email ou senha inválidos");
      }
    } catch (err) {
      setError(err.message || "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Entrar</h2>

        {error && <div style={styles.error}>{error}</div>}

        <input
          style={styles.input}
          placeholder="Usuário"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <div style={styles.footer}>
          <button
            style={styles.linkButton}
            onClick={() => setPage("register")}
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
    
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },

  card: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "16px",
    width: "320px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  title: {
    margin: 0,
    marginBottom: "10px",
    textAlign: "center",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
  },

  button: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#fff",
    fontWeight: "500",
    cursor: "pointer",
  },

  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "8px",
    borderRadius: "6px",
    fontSize: "13px",
    textAlign: "center",
  },
  footer: {
    marginTop: "12px",
    textAlign: "center",
  },

  linkButton: {
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "13px",
    textDecoration: "underline",
  },
};