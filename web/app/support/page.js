import { JsonLd } from "@/components/JsonLd"
import { SupportView } from "@/components/SupportView"
import { absoluteUrl, pageMetadata, routes, webPageJsonLd } from "@/lib/site"
import { faqAnswerText, supportCopy } from "@/lib/support-content"

const title = "Support — Captions Recorder for Google Meet"
const description =
  "How to use Captions Recorder for Google Meet, what each popup status means, and how to get help when captions are not recording."

export const metadata = pageMetadata({ lang: "en", page: "support", title, description })

export default function Page() {
  const url = absoluteUrl(routes.support.en)
  return (
    <>
      <JsonLd data={webPageJsonLd({ lang: "en", page: "support", title, description })} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          url,
          inLanguage: "en",
          mainEntity: supportCopy.en.faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faqAnswerText(item),
            },
          })),
        }}
      />
      <SupportView lang="en" />
    </>
  )
}
