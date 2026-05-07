const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    data = await res.json();
  } catch {
    // resposta sem JSON
  }

  // 🔐 sessão expirada
  if (res.status === 401) {
    window.dispatchEvent(new Event("auth-expired"));
    throw new Error("Sessão expirada");
  }

  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }

  return data;
};