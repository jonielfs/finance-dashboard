const API_URL = import.meta.env.VITE_API_URL;

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    data = await res.json();
  } catch {
    // resposta sem JSON
  }

  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }

  return data;
};