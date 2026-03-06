export default function OrderCard({ itemName, quantity, date, price }) {
  return (
    <div className="bento-card bento-card-hover animate-fade-in-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>
          {itemName}
        </h4>
        <p style={{ fontSize: "13px", color: "var(--color-slate-600)" }}>
          Qty: {quantity}
          {price != null && <> · ₹{price * quantity}</>}
        </p>
      </div>
      <div
        className="chip"
        style={{
          backgroundColor: "var(--color-amber-50)",
          color: "var(--color-ochre)",
          fontWeight: 500,
        }}
      >
        {date}
      </div>
    </div>
  );
}
