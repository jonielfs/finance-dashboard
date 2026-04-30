export default function Header({ title, onLogout, onNavigate, page }) {
  const version = import.meta.env.VITE_APP_VERSION;

  return (
    <div style={styles.header}>
      
      <div style={styles.left}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>{title}</h1>
          <span style={styles.version}>v{version}</span>
        </div>

        {onLogout && (
          <div style={styles.nav}>
            <button
              style={page === "dashboard" ? styles.navButtonActive : styles.navButton}
              onClick={() => onNavigate("dashboard")}
            >
              Dashboard
            </button>

            <button
              style={page === "cards" ? styles.navButtonActive : styles.navButton}
              onClick={() => onNavigate("cards")}
            >
              Cartões
            </button>

            <button
              style={page === "invoices" ? styles.navButtonActive : styles.navButton}
              onClick={() => onNavigate("invoices")}
            >
              Faturas
            </button>

            <button
              style={page === "goal" ? styles.navButtonActive : styles.navButton}
              onClick={() => onNavigate("goal")}
            >
              Meta
            </button>

            <button
              style={page === "purchases" ? styles.navButtonActive : styles.navButton}
              onClick={() => onNavigate("purchases")}
            >
              Compras
            </button>
          </div>
        )}
      </div>

      {onLogout && (
        <button style={styles.button} onClick={onLogout}>
          Sair
        </button>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    width: "100%",
  },

  left: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  title: {
    margin: 0,
  },

  version: {
    fontSize: "12px",
    color: "#6b7280",
    backgroundColor: "#e5e7eb",
    padding: "2px 6px",
    borderRadius: "6px",
  },

  nav: {
    display: "flex",
    gap: "8px",
  },

  navButton: {
    backgroundColor: "#e5e7eb",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },

  navButtonActive: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },

  button: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};