import { useState } from "react";
import { apiFetch } from "../services/api";

import Header from "../components/Header";

export default function Register( { onLogout } ) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerKey, setRegisterKey] = useState("");
  const [loading, setLoading] = useState(false);

   const handleRegister = async () => {
      if (!email || !password || !registerKey) {
        alert("Preencha todos os campos");
        return;
      }

      try {
        setLoading(true);

        const data = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, registerKey }),
        });

        alert("Usuário criado com sucesso!");
      } catch (err) {
        alert(err.message || "Erro ao cadastrar usuário");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div style={{ padding: 20 }}>
      <Header title="Cadastrar usuário" />

      <input
        placeholder="Usuário"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        type="password"
        placeholder="Senha"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <input
        placeholder="Chave de acesso"
        onChange={(e) => setRegisterKey(e.target.value)}
      />
      <br />

      <button onClick={handleRegister}>Cadastrar</button>
      <button onClick={() => window.location.reload()}>
        Voltar
    </button>
    </div>
  );
}