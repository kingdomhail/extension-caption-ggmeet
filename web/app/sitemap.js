import { absoluteUrl, routes } from "@/lib/site"

export default function sitemap() {
  const lastModified = new Date("2026-11-20")
  const pages = ["home", "support", "privacy"]

  return pages.flatMap((page) =>
    ["en", "vi"].map((lang) => ({
      url: absoluteUrl(routes[page][lang]),
      lastModified,
      changeFrequency: "monthly",
      priority: page === "home" && lang === "en" ? 1 : 0.7,
      alternates: {
        languages: {
          en: absoluteUrl(routes[page].en),
          vi: absoluteUrl(routes[page].vi),
          "x-default": absoluteUrl(routes[page].en),
        },
      },
    }))
  )
}
