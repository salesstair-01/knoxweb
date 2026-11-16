const sizes = { sm: 24, md: 48, lg: 96 };

export default function Spacer({ size, divider }) {
  return (
    <div style={{ height: sizes[size] || 48, display: "flex", alignItems: "center", padding: "0 var(--gutter)" }}>
      {divider ? <hr style={{ width: "100%", border: 0, borderTop: "1px dashed rgba(250,250,250,.4)" }} /> : null}
    </div>
  );
}
