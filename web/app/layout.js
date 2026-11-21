import { headers } from "next/headers"
import { AUTHOR, getSiteUrl, SITE_NAME } from "@/lib/site"
import "./globals.css"

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR, url: `mailto:kingdomhail.dev@gmail.com` }],
  creator: AUTHOR,
  publisher: AUTHOR,
  category: "productivity",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport = {
  themeColor: "#f4f7fb",
  width: "device-width",
  initialScale: 1,
}

export default async function RootLayout({ children }) {
  const headerList = await headers()
  const lang = headerList.get("x-locale") === "vi" ? "vi" : "en"

  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
