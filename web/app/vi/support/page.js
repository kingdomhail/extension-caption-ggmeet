import { JsonLd } from "@/components/JsonLd"
import { SupportView } from "@/components/SupportView"
import { absoluteUrl, pageMetadata, routes, webPageJsonLd } from "@/lib/site"
import { faqAnswerText, supportCopy } from "@/lib/support-content"

const title = "Hỗ trợ — Captions Recorder for Google Meet"
const description =
  "Hướng dẫn dùng Captions Recorder for Google Meet, ý nghĩa trạng thái trên popup và cách liên hệ khi phụ đề không được ghi."

export const metadata = pageMetadata({ lang: "vi", page: "support", title, description })

export default function Page() {
  const url = absoluteUrl(routes.support.vi)
  return (
    <>
      <JsonLd data={webPageJsonLd({ lang: "vi", page: "support", title, description })} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          url,
          inLanguage: "vi",
          mainEntity: supportCopy.vi.faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faqAnswerText(item),
            },
          })),
        }}
      />
      <SupportView lang="vi" />
    </>
  )
}
