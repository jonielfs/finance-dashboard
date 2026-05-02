export default function Header({ title, onLogout, onNavigate, page }) {
  const version = import.meta.env.VITE_APP_VERSION;

  const navItems = [
    ["dashboard", "Dashboard"],
    ["cards", "Cartões"],
    ["invoices", "Faturas"],
    ["goal", "Meta"],
    ["purchases", "Compras"],
  ];

  return (
    <div style={styles.header}>
      
      <div style={styles.topRow}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>{title}</h1>
          <span style={styles.version}>v{version}</span>
        </div>

        {onLogout && (
          <button style={styles.logoutButton} onClick={onLogout}>
            Sair
          </button>
        )}
      </div>

      {onLogout && (
        <div style={styles.nav}>
          {navItems.map(([key, label]) => (
            <button
              key={key}
              style={page === key ? styles.navButtonActive : styles.navButton}
              onClick={() => onNavigate(key)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    flexDirection: "column", // 🔥 mobile-first real
    gap: "12px",
    marginBottom: "20px",
    width: "100%",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "clamp(18px, 5vw, 24px)",
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
    flexWrap: "wrap", // 🔥 ESSENCIAL
    gap: "8px",
  },

  navButton: {
    backgroundColor: "#e5e7eb",
    border: "none",
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    flex: "1 1 auto", // 🔥 distribui melhor no mobile
  },

  navButtonActive: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    flex: "1 1 auto",
  },

  logoutButton: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    minHeight: "40px",
    whiteSpace: "nowrap",
  },
};