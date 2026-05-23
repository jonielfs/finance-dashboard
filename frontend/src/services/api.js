const API_URL = import.meta.env.VITE_API_URL;

let activeRequests = 0;

const emitRequestChange = () => {
  window.dispatchEvent(
    new CustomEvent("request-change", {
      detail: activeRequests,
    })
  );
};

export const apiFetch = async (
  endpoint,
  options = {}
) => {
  activeRequests++;

  emitRequestChange();

  try {
    const res = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      }
    );

    let data = {};

    try {
      data = await res.json();
    } catch {
      // resposta sem JSON
    }

    // 🔐 sessão expirada
    if (res.status === 401) {
      window.dispatchEvent(
        new Event("auth-expired")
      );

      throw new Error("Sessão expirada");
    }

    if (!res.ok) {
      throw new Error(
        data.error || `Erro ${res.status}`
      );
    }

    return data;
  } finally {
    activeRequests = Math.max(
      activeRequests - 1,
      0
    );

    emitRequestChange();
  }
};