import { JsonLd } from "@/components/JsonLd"
import { PrivacyView } from "@/components/PrivacyView"
import { pageMetadata, webPageJsonLd } from "@/lib/site"

const title = "Quyền riêng tư — Captions Recorder for Google Meet"
const description =
  "Chính sách quyền riêng tư của Captions Recorder for Google Meet. Phụ đề chỉ xử lý trên trình duyệt của bạn và không được gửi đi."

export const metadata = pageMetadata({ lang: "vi", page: "privacy", title, description })

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          ...webPageJsonLd({ lang: "vi", page: "privacy", title, description }),
          dateModified: "2026-11-20",
        }}
      />
      <PrivacyView lang="vi" />
    </>
  )
}
