// Placeholder wordmark until the client supplies the logo files.
export default function Wordmark({ size = 32 }) {
  return (
    <span
      aria-label="Knox"
      style={{
        fontFamily: "var(--ff-display)",
        fontSize: size,
        lineHeight: 1,
        color: "var(--c-accent)",
        letterSpacing: "0.32em",
      }}
    >
      KNOX
    </span>
  );
}
