export const SITE_NAME = "Captions Recorder for Google Meet"
export const AUTHOR = "Hải Lập Trình"
export const EMAIL = "kingdomhail.dev@gmail.com"
export const FACEBOOK = "https://www.facebook.com/kingdomhail.dev"
export const VERSION = "1.1.0"

export const routes = {
  home: { en: "/", vi: "/vi" },
  support: { en: "/support", vi: "/vi/support" },
  privacy: { en: "/privacy", vi: "/vi/privacy" },
}

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return raw.replace(/\/+$/, "")
}

export function absoluteUrl(path) {
  return `${getSiteUrl()}${path}`
}

export function pageMetadata({ lang, page, title, description }) {
  const path = routes[page][lang]
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        en: routes[page].en,
        vi: routes[page].vi,
        "x-default": routes[page].en,
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: lang === "vi" ? "vi_VN" : "en_US",
      alternateLocale: lang === "vi" ? ["en_US"] : ["vi_VN"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  }
}

export function webPageJsonLd({ lang, page, title, description }) {
  const path = routes[page][lang]
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    inLanguage: lang === "vi" ? "vi" : "en",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl(),
      inLanguage: ["en", "vi"],
    },
  }
}
