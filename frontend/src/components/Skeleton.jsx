export default function Skeleton() {
  return (
    <div style={styles.container}>
      <div style={styles.card}></div>
      <div style={styles.card}></div>
      <div style={styles.card}></div>
      <div style={styles.card}></div>
    </div>
  );
}

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  card: {
    height: "80px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, #eee, #ddd, #eee)",
    animation: "pulse 1.5s infinite",
  },
};