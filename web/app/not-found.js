import Link from "next/link"

export const metadata = {
  title: "Page not found — Captions Recorder for Google Meet",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main className="page-hero">
      <div className="wrap">
        <p className="kicker">404</p>
        <h1>This page is not on the site.</h1>
        <p className="lede">The English site starts at the home page. Vietnamese pages live under /vi.</p>
        <div className="cta">
          <Link className="btn btn-primary" href="/">
            Home
          </Link>
          <Link className="btn btn-ghost" href="/vi">
            Trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
