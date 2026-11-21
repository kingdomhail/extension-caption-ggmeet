import Link from "next/link"
import { AUTHOR, EMAIL, routes, SITE_NAME, VERSION } from "@/lib/site"

const chrome = {
  en: {
    skip: "Skip to content",
    home: "Home",
    support: "Support",
    privacy: "Privacy",
    language: "Language",
  },
  vi: {
    skip: "Tới nội dung",
    home: "Trang chủ",
    support: "Hỗ trợ",
    privacy: "Quyền riêng tư",
    language: "Ngôn ngữ",
  },
}

export function SiteChrome({ lang, page, children }) {
  const t = chrome[lang]
  const href = (key) => routes[key][lang]

  return (
    <>
      <a className="skip" href="#content">
        {t.skip}
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <Link className="brand" href={href("home")}>
            <span className="mark" aria-hidden="true">
              CC<span className="live-dot" />
            </span>
            <span className="brand-name">
              <strong>Captions Recorder</strong>
              <small>for Google Meet</small>
            </span>
          </Link>
          <nav className="nav" aria-label="Primary">
            <Link href={href("home")} aria-current={page === "home" ? "page" : undefined}>
              {t.home}
            </Link>
            <Link href={href("support")} aria-current={page === "support" ? "page" : undefined}>
              {t.support}
            </Link>
            <Link href={href("privacy")} aria-current={page === "privacy" ? "page" : undefined}>
              {t.privacy}
            </Link>
          </nav>
          <div className="lang-switch" role="group" aria-label={t.language}>
            <Link
              className="lang-btn"
              href={routes[page].vi}
              hrefLang="vi"
              lang="vi"
              aria-current={lang === "vi" ? "true" : undefined}
            >
              VI
            </Link>
            <Link
              className="lang-btn"
              href={routes[page].en}
              hrefLang="en"
              lang="en"
              aria-current={lang === "en" ? "true" : undefined}
            >
              EN
            </Link>
          </div>
        </div>
      </header>
      <main id="content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div className="wrap footer-row">
          <div>
            <div>© 2026 {AUTHOR}</div>
            <div>
              {SITE_NAME} · {VERSION}
            </div>
          </div>
          <div className="footer-links">
            <Link href={href("home")}>{t.home}</Link>
            <Link href={href("support")}>{t.support}</Link>
            <Link href={href("privacy")}>{t.privacy}</Link>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
        </div>
      </footer>
    </>
  )
}
