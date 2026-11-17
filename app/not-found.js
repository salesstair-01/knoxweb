import Header from "@/puck/chrome/Header";
import Footer from "@/puck/chrome/Footer";

export default function NotFound() {
  return (
    <>
      <Header overlay={false} />
      <main style={{ padding: "120px var(--gutter)", minHeight: "50vh" }}>
        <h1 className="k-label">Page not found</h1>
        <p style={{ marginTop: 24, fontSize: 20 }}>
          This page doesn&apos;t exist or the offer has ended.
        </p>
        <p style={{ marginTop: 32 }}>
          <a href="/" className="k-btn">Back to home</a>
        </p>
      </main>
      <Footer />
    </>
  );
}
