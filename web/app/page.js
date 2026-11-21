import { HomeView } from "@/components/HomeView"
import { JsonLd } from "@/components/JsonLd"
import { AUTHOR, absoluteUrl, pageMetadata, routes, SITE_NAME, webPageJsonLd } from "@/lib/site"

const title = "Captions Recorder for Google Meet"
const description =
  "Official site for Captions Recorder for Google Meet. Capture, preview, copy, and export live Google Meet captions with timestamps in your browser."

export const metadata = pageMetadata({ lang: "en", page: "home", title, description })

export default function Page() {
  const url = absoluteUrl(routes.home.en)
  return (
    <>
      <JsonLd data={webPageJsonLd({ lang: "en", page: "home", title, description })} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          applicationCategory: "BrowserApplication",
          operatingSystem: "Chrome",
          description,
          url,
          inLanguage: "en",
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          author: {
            "@type": "Person",
            name: AUTHOR,
          },
        }}
      />
      <HomeView lang="en" />
    </>
  )
}
