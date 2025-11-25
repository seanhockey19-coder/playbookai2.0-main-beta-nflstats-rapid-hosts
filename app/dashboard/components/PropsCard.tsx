export default function PropsCard({
  game,
  propsData,
  loading,
}: {
  game?: any;
  propsData: any[];
  loading: boolean;
}) {
  return (
    <div
      style={{
        background: "#111",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #333",
      }}
    >
      <h3 style={{ color: "#0ff", marginBottom: "0.5rem" }}>Player Props</h3>

      {loading && <p>Loading props…</p>}

      {!loading &&
        propsData.map((p, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            <strong>{p.player}</strong>
            <br />
            {p.stat.replace(/_/g, " ")} — {p.line}
            <br />
            Odds: {p.odds}
          </div>
        ))}
    </div>
  );
}
