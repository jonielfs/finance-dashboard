import { useState } from "react";

import { formatMoney } from "../utils/format";

export default function MetricCard({ title, value, color, tooltip }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={styles.wrapper}
      onMouseEnter={() => setShowTooltip(true)}   // 👈 AQUI
      onMouseLeave={() => setShowTooltip(false)} // 👈 AQUI
    >
      <div
        style={{
          ...styles.card,
          borderLeft: `6px solid ${color}`,
        }}
      >
        <p style={styles.title}>{title}</p>
        <h2 style={styles.value}>
          { formatMoney(value) }
        </h2>
      </div>

      {showTooltip && (
        <div style={styles.tooltip}>
          {tooltip}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
  },
  card: {
    backgroundColor: "#fff",
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  title: {
    margin: 0,
    color: "#6b7280",
  },
  value: {
    margin: 0,
  },
  tooltip: {
    position: "absolute",
    bottom: "110%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#111827",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    zIndex: 10,
  },
};