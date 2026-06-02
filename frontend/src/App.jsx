import { useEffect, useState } from "react";
import DashboardChart from "./components/DashboardChart";
import { apiFetch } from "./services/api";
import { formatMoney } from "./utils/format";

import Login from "./pages/Login";
import MetricCard from "./components/MetricCard";
import Skeleton from "./components/Skeleton";
import Register from "./pages/Register";
import Header from "./components/Header";
import Cards from "./pages/Cards";
import Invoices from "./pages/Invoices";
import Goal from "./pages/Goal";
import Purchases from "./pages/Purchases";

// 🎨 styles mobile-first
const styles = {
  container: {
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
    padding: "clamp(12px, 4vw, 24px)",
    maxWidth: "1200px",
    margin: "0 auto",
    boxSizing: "border-box",
  },

  headerSpacing: {
    marginBottom: "clamp(12px, 3vw, 20px)",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "clamp(10px, 3vw, 16px)",
    marginBottom: "clamp(16px, 4vw, 24px)",
  },

  chartCard: {
    backgroundColor: "#fff",
    padding: "clamp(12px, 3vw, 20px)",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    overflowX: "auto",
  },

  alert: (isOver) => ({
    padding: "clamp(10px, 3vw, 14px)",
    borderRadius: "10px",
    backgroundColor: isOver ? "#fee2e2" : "#dcfce7",
    color: isOver ? "#991b1b" : "#166534",
    marginBottom: "clamp(12px, 3vw, 20px)",
    fontWeight: "500",
    fontSize: "clamp(13px, 3.5vw, 15px)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    flexWrap: "wrap",
  }),
};

const loadingStyles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
    textAlign: "center",
  },

  logoWrapper: {
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "spin 7s linear infinite",
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  title: {
    marginTop: "20px",
    fontSize: "20px",
  },

  subtitle: {
    marginTop: "10px",
    color: "#6b7280",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(255,255,255,0.4)",
    backdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  loadingBox: {
    backgroundColor: "#fff",
    padding: "16px 24px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: "500",
  },

  spinner: {
    width: "18px",
    height: "18px",
    border: "3px solid #d1d5db",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

function App() {
  const [data, setData] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [isAuth, setIsAuth] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [isRequestLoading, setIsRequestLoading] = useState(false);

  // 🔐 valida sessão no carregamento
  useEffect(() => {
    let isMounted = true;

    const slowTimer = setTimeout(() => {
      if (isMounted) {
        setIsSlowLoading(true);
      }
    }, 30000);

    apiFetch("/protected")
      .then(() => {
        if (isMounted) {
          setIsAuth(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuth(false);
        }
      })
      .finally(() => {
        clearTimeout(slowTimer);
      });

    return () => {
      isMounted = false;
      clearTimeout(slowTimer);
    };
  }, []);

  // 🌐 loading global de requests
useEffect(() => {
  const handleRequestChange = (e) => {
    setIsRequestLoading(e.detail > 0);
  };

  window.addEventListener(
    "request-change",
    handleRequestChange
  );

  return () => {
    window.removeEventListener(
      "request-change",
      handleRequestChange
    );
  };
}, []);

  // 🔐 sessão expirada globalmente
  useEffect(() => {
    const handleAuthExpired = () => {
      setRawData(null);
      setData([]);
      setPage("dashboard");
      setIsAuth(false);
    };

    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, []);

  // 📊 carrega dashboard apenas se autenticado
  useEffect(() => {
    if (!isAuth) return;

    let isMounted = true;

    apiFetch("/dashboard/history")
      .then((json) => {
        if (!isMounted) return;

        setRawData(json);

        const totalsArray = json.totals.map((v) => Number(v) || 0);

        const windowSize = 3;

        const movingAvg = totalsArray.map((_, index) => {
          const slice = totalsArray
            .slice(Math.max(0, index - windowSize + 1), index + 1)
            .filter((v) => v > 0);

          if (slice.length === 0) return null;

          const avg =
            slice.reduce((sum, v) => sum + v, 0) / slice.length;

          return Number(avg.toFixed(2));
        });

        const formatted = json.months.map((month, index) => {
          const [year, m] = month.split("-");

          const totals = Number(json.totals[index] || 0);
          const commitments = Number(json.commitments[index] || 0);
          const goals = Number(json.goals[index] || 0);

          return {
            month: `${m}/${year.slice(2)}`,
            totals: totals > 0 ? totals : null,
            commitments,
            goals,
            avg: movingAvg[index],
          };
        });

        setData(formatted);
      })
      .catch((err) => {
        console.error("Erro ao carregar dashboard:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuth, page]);

  // 🚪 logout
  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch {}

    setRawData(null);
    setData([]);
    setPage("dashboard");
    setIsAuth(false);
  };

  const globalLoadingOverlay = isRequestLoading && (
    <div style={loadingStyles.overlay}>
      <div style={loadingStyles.loadingBox}>
        <div style={loadingStyles.spinner} />

        <span>Carregando...</span>
      </div>
    </div>
  );

  // ⏳ loading inicial
  if (isAuth === null) {
    return (
      <>
        {globalLoadingOverlay}

        <div style={styles.container}>
          {isRequestLoading && (
            <div style={loadingStyles.overlay}>
              <div style={loadingStyles.loadingBox}>
                <div style={loadingStyles.spinner} />

                <span>Carregando...</span>
              </div>
            </div>
          )}
          <div style={loadingStyles.wrapper}>
            <div style={loadingStyles.logoWrapper}>
              <img
                src="/favicon.svg"
                alt="loading"
                style={loadingStyles.logo}
              />
            </div>

            <h2 style={loadingStyles.title}>
              Carregando seu dashboard...
            </h2>

            <p style={loadingStyles.subtitle}>
              {!isSlowLoading
                ? "Por favor aguarde..."
                : "Demorando mais que o esperado, mas quase lá... ☕"}
            </p>
          </div>
        </div>
      </>
    );
  }

  // 🔐 não autenticado
  if (!isAuth) {
    
    if (page === "register") {
      return (
        <>
          {globalLoadingOverlay}

          <Register setPage={setPage} />
        </>
      );
    } 

    return <Login setPage={setPage} />;

  }

  // 📄 rotas
  if (page === "cards") {
    return (
      <>
        {globalLoadingOverlay}
        <Cards
          onLogout={handleLogout}
          setPage={setPage}
          page={page}
        />
      </>
    );
  }

  if (page === "invoices") {
    return (
      <>
        {globalLoadingOverlay}
        <Invoices
          onLogout={handleLogout}
          setPage={setPage}
          page={page}
        />
      </>
    );
  }

  if (page === "goal") {
    return (
      <>
        {globalLoadingOverlay}
        <Goal
          onLogout={handleLogout}
          setPage={setPage}
          page={page}
        />
      </>
    );
  }

  if (page === "purchases") {
    return (
      <>
        {globalLoadingOverlay}
        <Purchases
          onLogout={handleLogout}
          setPage={setPage}
          page={page}
        />
      </>
    );
  }

  // 📊 dashboard
  if (page === "dashboard") {
    if (!rawData) {
      return (
        <>
          {globalLoadingOverlay}
            <div style={styles.container}>
              {isRequestLoading && (
                <div style={loadingStyles.overlay}>
                  <div style={loadingStyles.loadingBox}>
                    <div style={loadingStyles.spinner} />

                    <span>Carregando...</span>
                  </div>
                </div>
              )}
              <Header
                title="Dashboard Financeiro"
                onLogout={handleLogout}
                onNavigate={setPage}
                page={page}
              />

              <Skeleton />
            </div>
        </>
      );
    }

    const currentMonthData = [...data]
      .reverse()
      .find((d) => d.totals !== null);

    const currentMonth = currentMonthData?.totals || 0;
    const goal = currentMonthData?.goals || 0;

    const today = new Date();

    const dayOfMonth = today.getDate();

    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    const avgDaily =
      dayOfMonth > 0 ? currentMonth / dayOfMonth : 0;

    const remainingGoal = Math.max(goal - currentMonth, 0);

    const remainingDays = Math.max(daysInMonth - dayOfMonth, 1);

    const idealDaily =
      remainingGoal / remainingDays;

    const isAboveIdeal = avgDaily > idealDaily;

    const avgColor = isAboveIdeal
      ? "#dc2626"
      : "#16a34a";

    const open = rawData.commitments.reduce(
      (sum, v) => sum + v,
      0
    );

    const isOver =
      goal > 0 && currentMonth > goal;

    return (
      <div style={styles.container}>
        <Header
          title="Dashboard Financeiro"
          onLogout={handleLogout}
          onNavigate={setPage}
          page={page}
        />

        <div style={styles.cardGrid}>
          <MetricCard
            title="Gasto do mês"
            value={currentMonth}
            color="#2563eb"
            tooltip="Soma das faturas do mês atual"
          />

          <MetricCard
            title="Meta"
            value={goal}
            color="#dc2626"
            tooltip="Valor máximo planejado para gasto mensal"
          />

          <MetricCard
            title="Parcelas a pagar"
            value={open}
            color="#d97706"
            tooltip="Soma das parcelas dentro do período exibido no gráfico"
          />

          <MetricCard
            title="Média diária"
            value={avgDaily}
            color={avgColor}
            tooltip={`Gasto médio por dia. Ideal: ${formatMoney(idealDaily)}`}
          />
        </div>

        <div style={styles.alert(isOver)}>
          <span>{isOver ? "⚠️" : "✅"}</span>

          <span>
            {isOver
              ? "Atenção: você está acima da meta"
              : "Você está dentro da meta"}
          </span>
        </div>

        <div style={styles.chartCard}>
          <DashboardChart data={data} />
        </div>
      </div>
    );
  }

  return null;
}

export default App;