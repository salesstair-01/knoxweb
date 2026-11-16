// One responsive image: optional separate mobile crop (the live hero uses different crops).
export default function Picture({ src, mobile_src, alt, className, eager }) {
  if (!src) {
    return <div className={className} style={{ background: "var(--c-surface-2)" }} aria-hidden />;
  }
  return (
    <picture>
      {mobile_src ? <source media="(max-width: 767px)" srcSet={mobile_src} /> : null}
      <img src={src} alt={alt || ""} className={className} loading={eager ? "eager" : "lazy"} />
    </picture>
  );
}
