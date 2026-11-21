import { SiteChrome } from "@/components/SiteChrome"
import { EMAIL, FACEBOOK } from "@/lib/site"

export function PrivacyView({ lang }) {
  return (
    <SiteChrome lang={lang} page="privacy">
      {lang === "en" ? <PrivacyEnglish /> : <PrivacyVietnamese />}
    </SiteChrome>
  )
}

function PrivacyEnglish() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Privacy policy</p>
          <h1>Captions Recorder for Google Meet</h1>
          <p className="lede">
            The English text on this page is the official privacy policy. The Vietnamese text, at /vi/privacy, is a translation for easier reading.
          </p>
        </div>
      </section>
      <article className="section prose wrap">
        <p className="dated">
          Effective date: November 21, 2026
          <br />
          Developer: Hải Lập Trình
        </p>

        <h2>1. Overview</h2>
        <p>
          <strong>Captions Recorder for Google Meet</strong> (“the Extension”) is designed so that all caption processing and temporary storage happen only inside your web browser, on your own device.
        </p>

        <h2>2. Scope of operation</h2>
        <p>
          The Extension operates only on Google Meet pages (<code>https://meet.google.com/*</code>). It does not run on, monitor, read, or interact with any other websites, browser tabs, or browsing history.
        </p>

        <h2>3. Information handled on your device</h2>
        <p>While a Google Meet call is open, the Extension reads information Meet is already showing and stores it in <code>chrome.storage.local</code> on that device:</p>
        <ul>
          <li>Caption lines: local time, speaker name, spoken text, and the profile photo address when Meet shows one.</li>
          <li>Participant names, and the profile photo address when Meet shows one.</li>
          <li>In-call chat: sender name, time, message text, and the profile photo address when Meet shows one.</li>
          <li>Whether <strong>Keep mic muted</strong> is on. This choice is stored on the device and is not tied to one room.</li>
        </ul>
        <p>
          The developer does not receive, log, or store this information on any server. It is not sold, rented, or transferred to a third party. The Extension has no analytics, advertising, or tracking.
        </p>
        <p>
          To show a profile photo, the popup loads that image from the Google address already displayed in the meeting. That is the only network request the Extension causes. If the image does not load, the popup shows the person&apos;s initials.
        </p>

        <h2>4. Microphone</h2>
        <p>
          The Extension does not request microphone permission and does not record audio. <strong>Keep mic muted</strong> stays off until you turn it on. When it is on, the Extension clicks the mute control Google Meet is already showing, labeled &quot;Turn off microphone&quot; or &quot;Tắt micrô&quot;, so an open microphone is turned off again.
        </p>

        <h2>5. Your control</h2>
        <p>
          <strong>Clear Data</strong> deletes the caption transcript for the current room after you confirm. Captions, participant names, chat, photo addresses, and the mute setting are removed when you clear the Extension&apos;s data in Chrome or uninstall the Extension.
        </p>

        <h2>6. Browser permissions explained</h2>
        <p>The Extension requests only the permissions it needs:</p>
        <ul>
          <li>
            <strong><code>storage</code>:</strong> saves the information listed above in <code>chrome.storage.local</code> on your device.
          </li>
          <li>
            <strong><code>activeTab</code>:</strong> when you open the popup, checks that the current tab is a Google Meet room and talks to the content script on that tab.
          </li>
          <li>
            <strong>Content script on <code>https://meet.google.com/*</code> only:</strong> reads the captions, participant list, and in-call chat Meet is showing. When Keep mic muted is on, it clicks Meet&apos;s mute button. It does not run on any other site and does not use remotely hosted code.
          </li>
        </ul>

        <h2>7. Changes to this privacy policy</h2>
        <p>
          If the Extension&apos;s privacy practices change in a future update, this privacy policy will be updated and the effective date at the top of this page will change with it.
        </p>

        <h2>8. Contact</h2>
        <p>If you have questions about this privacy policy or the Extension, contact:</p>
        <ul>
          <li>
            <strong>Developer:</strong> Hải Lập Trình
          </li>
          <li>
            <strong>Support:</strong> <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
          <li>
            <strong>Facebook:</strong>{" "}
            <a href={FACEBOOK} target="_blank" rel="noopener noreferrer">
              facebook.com/kingdomhail.dev
            </a>
          </li>
        </ul>
        <p>© 2026 Hải Lập Trình. All rights reserved.</p>

        <div className="note">
          <p>
            <strong>About this website.</strong> These pages do not use forms, analytics, or advertising cookies. English is the default language. Vietnamese pages are separate addresses under /vi. The language switch is a normal link, and this site does not save a language preference on your device.
          </p>
        </div>
      </article>
    </>
  )
}

function PrivacyVietnamese() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker">Chính sách quyền riêng tư</p>
          <h1>Captions Recorder for Google Meet</h1>
          <p className="lede">
            Bản tiếng Anh tại /privacy là bản chính của chính sách này. Bản tiếng Việt là bản dịch để dễ đọc.
          </p>
        </div>
      </section>
      <article className="section prose wrap">
        <p className="dated">
          Có hiệu lực: 21 tháng 11 năm 2026
          <br />
          Nhà phát triển: Hải Lập Trình
        </p>

        <h2>1. Tổng quan</h2>
        <p>
          <strong>Captions Recorder for Google Meet</strong> (“Tiện ích”) được làm để phụ đề chỉ được xử lý và lưu tạm bên trong trình duyệt, trên máy của bạn.
        </p>

        <h2>2. Phạm vi hoạt động</h2>
        <p>
          Tiện ích chỉ chạy trên trang Google Meet (<code>https://meet.google.com/*</code>). Nó không chạy, không theo dõi, không đọc và không tương tác với website khác, tab khác hay lịch sử duyệt web.
        </p>

        <h2>3. Thông tin được xử lý trên máy bạn</h2>
        <p>Khi một cuộc Google Meet đang mở, tiện ích đọc những gì Meet đang hiện và lưu vào <code>chrome.storage.local</code> trên máy đó:</p>
        <ul>
          <li>Dòng phụ đề: giờ trên máy, tên người nói, câu nói, và địa chỉ ảnh đại diện nếu Meet có hiện.</li>
          <li>Tên người trong phòng, và địa chỉ ảnh đại diện nếu Meet có hiện.</li>
          <li>Chat trong cuộc gọi: tên người gửi, giờ, nội dung, và địa chỉ ảnh đại diện nếu Meet có hiện.</li>
          <li>Bạn có bật <strong>Keep mic muted</strong> hay không. Lựa chọn này lưu trên máy và không gắn với một phòng.</li>
        </ul>
        <p>
          Nhà phát triển không nhận, không ghi nhật ký và không lưu các thông tin này trên máy chủ nào. Thông tin không được bán, cho thuê hoặc chuyển cho bên thứ ba. Tiện ích không có thống kê, quảng cáo hay theo dõi.
        </p>
        <p>
          Để hiện ảnh đại diện, popup tải ảnh từ địa chỉ Google mà Meet đang hiện. Đó là request mạng duy nhất do tiện ích gây ra. Ảnh không tải được thì popup hiện chữ cái đầu của tên.
        </p>

        <h2>4. Micrô</h2>
        <p>
          Tiện ích không xin quyền micrô và không ghi âm. <strong>Keep mic muted</strong> tắt cho đến khi bạn bật. Khi bật, tiện ích bấm nút tắt mic mà Google Meet đang hiện, nhãn là &quot;Turn off microphone&quot; hoặc &quot;Tắt micrô&quot;, để mic đang mở được tắt lại.
        </p>

        <h2>5. Quyền kiểm soát của bạn</h2>
        <p>
          <strong>Clear Data</strong> xóa bản phụ đề của phòng hiện tại sau khi bạn xác nhận. Phụ đề, tên người, chat, địa chỉ ảnh và lựa chọn tắt mic bị xóa khi bạn xóa dữ liệu tiện ích trong Chrome hoặc gỡ tiện ích.
        </p>

        <h2>6. Giải thích quyền trình duyệt</h2>
        <p>Tiện ích chỉ xin những quyền đủ để chạy:</p>
        <ul>
          <li>
            <strong><code>storage</code>:</strong> lưu các thông tin nêu trên trong <code>chrome.storage.local</code> trên máy bạn.
          </li>
          <li>
            <strong><code>activeTab</code>:</strong> khi bạn mở popup, kiểm tra tab hiện tại có phải phòng Google Meet và trao đổi với content script trên tab đó.
          </li>
          <li>
            <strong>Content script chỉ trên <code>https://meet.google.com/*</code>:</strong> đọc phụ đề, danh sách người và chat mà Meet đang hiện. Khi Keep mic muted bật, nó bấm nút tắt mic của Meet. Nó không chạy trên trang khác và không dùng mã tải từ máy chủ.
          </li>
        </ul>

        <h2>7. Thay đổi chính sách</h2>
        <p>
          Nếu cách xử lý dữ liệu của tiện ích thay đổi ở bản cập nhật sau, chính sách này sẽ được sửa và ngày hiệu lực ở đầu trang sẽ đổi theo.
        </p>

        <h2>8. Liên hệ</h2>
        <p>Nếu bạn có câu hỏi về chính sách này hoặc về tiện ích, hãy liên hệ:</p>
        <ul>
          <li>
            <strong>Nhà phát triển:</strong> Hải Lập Trình
          </li>
          <li>
            <strong>Hỗ trợ:</strong> <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
          <li>
            <strong>Facebook:</strong>{" "}
            <a href={FACEBOOK} target="_blank" rel="noopener noreferrer">
              facebook.com/kingdomhail.dev
            </a>
          </li>
        </ul>
        <p>© 2026 Hải Lập Trình. Bảo lưu mọi quyền.</p>

        <div className="note">
          <p>
            <strong>Về website này.</strong> Các trang không có biểu mẫu, không có thống kê truy cập và không có cookie quảng cáo. Tiếng Anh là ngôn ngữ mặc định. Trang tiếng Việt nằm ở địa chỉ riêng, bắt đầu bằng /vi. Nút đổi ngôn ngữ là liên kết thông thường, website không lưu lựa chọn ngôn ngữ trên máy bạn.
          </p>
        </div>
      </article>
    </>
  )
}
