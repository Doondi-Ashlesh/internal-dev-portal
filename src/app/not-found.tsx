import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="shell">
      <div className="container" style={{ padding: "48px 0" }}>
        <section className="card card-pad stack-lg" style={{ maxWidth: 640 }}>
          <span className="pill">404</span>
          <div>
            <h1 className="page-title" style={{ fontSize: "2.4rem" }}>
              That service page does not exist yet.
            </h1>
            <p className="muted">
              The catalog route is wired for dynamic service pages, but this slug is not in the current sample dataset.
            </p>
          </div>
          <Link href="/catalog" className="button-link">
            Back to catalog
          </Link>
        </section>
      </div>
    </main>
  );
}
