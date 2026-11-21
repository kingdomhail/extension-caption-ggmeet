import { HomeView } from "@/components/HomeView"
import { JsonLd } from "@/components/JsonLd"
import { AUTHOR, absoluteUrl, pageMetadata, routes, SITE_NAME, webPageJsonLd } from "@/lib/site"

const title = "Ghi phụ đề Google Meet — Captions Recorder"
const description =
  "Trang chính thức của Captions Recorder for Google Meet. Ghi, xem trước, sao chép và xuất phụ đề Google Meet kèm giờ, ngay trên trình duyệt."

export const metadata = pageMetadata({ lang: "vi", page: "home", title, description })

export default function Page() {
  const url = absoluteUrl(routes.home.vi)
  return (
    <>
      <JsonLd data={webPageJsonLd({ lang: "vi", page: "home", title, description })} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          applicationCategory: "BrowserApplication",
          operatingSystem: "Chrome",
          description,
          url,
          inLanguage: "vi",
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
      <HomeView lang="vi" />
    </>
  )
}
