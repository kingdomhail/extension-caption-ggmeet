import { JsonLd } from "@/components/JsonLd"
import { PrivacyView } from "@/components/PrivacyView"
import { pageMetadata, webPageJsonLd } from "@/lib/site"

const title = "Privacy Policy — Captions Recorder for Google Meet"
const description =
  "Privacy policy for Captions Recorder for Google Meet. Captions are processed only in your browser and are never sent out."

export const metadata = pageMetadata({ lang: "en", page: "privacy", title, description })

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          ...webPageJsonLd({ lang: "en", page: "privacy", title, description }),
          dateModified: "2026-11-20",
        }}
      />
      <PrivacyView lang="en" />
    </>
  )
}
