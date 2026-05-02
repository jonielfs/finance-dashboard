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

function App() {
  const [data, setData] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [isAuth, setIsAuth] = useState(null); // 🔥 agora controlado via backend
  const [page, setPage] = useState("dashboard");

  // 🔐 valida sessão no carregamento
  useEffect(() => {
    apiFetch("/protected")
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));
  }, []);

  // 📊 carrega dashboard apenas se autenticado
  useEffect(() => {
    if (!isAuth) return;

    apiFetch("/dashboard/history").then((json) => {
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
    });
  }, [isAuth, page]);

  // 🚪 logout via backend
  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {}

    setIsAuth(false); // 👈 evita reload
  };

  // ⏳ loading inicial
  if (isAuth === null) {
    return (
      <div style={styles.container}>
        <Skeleton />
      </div>
    );
  }

  // 🔐 não autenticado
  if (!isAuth) {
    if (page === "register") {
      return <Register setPage={setPage} />;
    }
    return <Login setPage={setPage} />;
  }

  // 📄 rotas
  if (page === "cards") {
    return <Cards onLogout={handleLogout} setPage={setPage} page={page} />;
  }

  if (page === "invoices") {
    return <Invoices onLogout={handleLogout} setPage={setPage} page={page} />;
  }

  if (page === "goal") {
    return <Goal onLogout={handleLogout} setPage={setPage} page={page} />;
  }

  if (page === "purchases") {
    return <Purchases onLogout={handleLogout} setPage={setPage} page={page} />;
  }

  // 📊 dashboard
  if (page === "dashboard") {
    if (!rawData) {
      return (
        <div style={styles.container}>
          <Header
            title="Dashboard Financeiro"
            onLogout={handleLogout}
            onNavigate={setPage}
            page={page}
          />
          <Skeleton />
        </div>
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

    const avgDaily = dayOfMonth > 0 ? currentMonth / dayOfMonth : 0;
    const idealDaily = goal > 0 ? goal / daysInMonth : 0;

    const isAboveIdeal = avgDaily > idealDaily;
    const avgColor = isAboveIdeal ? "#dc2626" : "#16a34a";

    const open = rawData.commitments.reduce((sum, v) => sum + v, 0);
    const isOver = goal > 0 && currentMonth > goal;

    return (
      <div style={styles.container}>
        <Header
          title="Dashboard Financeiro"
          onLogout={handleLogout}
          onNavigate={setPage}
          page={page}
        />

        <div style={styles.cardGrid}>
          <MetricCard title="Gasto do mês" value={currentMonth} color="#2563eb" />
          <MetricCard title="Meta" value={goal} color="#dc2626" />
          <MetricCard title="Parcelas (próx. meses)" value={open} color="#d97706" />
          <MetricCard title="Média diária" value={Math.round(avgDaily)} color={avgColor} />
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