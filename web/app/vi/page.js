import { HomeView } from "@/components/HomeView"
import { JsonLd } from "@/components/JsonLd"
import { AUTHOR, absoluteUrl, pageMetadata, routes, SITE_NAME, webPageJsonLd } from "@/lib/site"

const title = "Ghi phụ đề, người và chat Google Meet"
const description =
  "Trang chính thức của Captions Recorder for Google Meet. Lưu phụ đề, danh sách người và chat ngay trên trình duyệt, và giữ mic tắt."

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
