import Link from "next/link"
import { SiteChrome } from "@/components/SiteChrome"
import { routes } from "@/lib/site"

const copy = {
  en: {
    kicker: "Official site",
    title: "Record Meet captions, people, and chat in your browser.",
    lede: "Captions Recorder for Google Meet keeps the caption text, the participant list, and in-call chat on your device. Each line shows the person's name and photo. You can export captions and chat as text, and the participant list as PDF, Excel, or PNG. An optional switch turns the microphone off again if it opens.",
    howTo: "How to use",
    privacy: "Privacy policy",
    caption:
      "Illustration of the popup. Labels in the product are English.",
    lines: [
      { time: "09:15:04", speaker: "Alex Nguyen", text: "Welcome everyone to today's sprint review." },
      { time: "09:15:18", speaker: "Minh Tran", text: "Thanks Alex, let me share the updates from this week." },
      { time: "09:15:31", speaker: "Alex Nguyen", text: "Please take a look at the item on screen." },
    ],
    featuresKicker: "Features",
    featuresTitle: "What the extension does",
    featuresIntro:
      "It does not record audio and it does not translate. It keeps what Google Meet is already showing, and it can click Meet's mute button when you ask it to.",
    features: [
      ["Captions, with the speaker", "After you turn captions on, each line keeps the local time, the speaker's name, their photo when Meet shows one, and the spoken text."],
      ["People in the room", "The People tab lists names and photos. Open People in Meet for the full room. Download the list as PDF, Excel, or PNG."],
      ["In-call chat", "The Chat tab keeps messages already visible in Meet, with the sender's name, photo, and time. Download them as a .txt file."],
      ["Keep the microphone off", "Turn on Keep mic muted in the popup. If the mic opens, including by accident, the extension clicks Turn off microphone in Meet. It does not record sound."],
      ["Copy or download captions", "Copy All puts the transcript on the clipboard. Download .txt saves meet-captions-YYYY-MM-DD.txt, one line per utterance."],
      ["Keep each room separate", "Captions, people, and chat stay in Chrome's local storage, keyed by room code. Closing the popup does not erase them. Clear Data asks you to confirm first."],
    ],
    formatKicker: "Format",
    formatTitle: "What the downloaded file contains",
    formatIntro:
      "Each line is one recorded utterance. The date in the file name is the day you download it, using your computer's clock.",
    log: [
      ["09:15:04", "Alex Nguyen", "Welcome everyone to today's sprint review."],
      ["09:15:18", "Minh Tran", "Thanks Alex, let me share the updates from this week."],
    ],
    stepsKicker: "How to use",
    stepsTitle: "Three steps during a meeting",
    steps: [
      ["Join a Google Meet room", "Open a meeting on meet.google.com. If that tab was already open before you installed the extension, reload it with F5."],
      ["Turn on captions in Meet", "Click CC, or Captions, in the Google Meet controls. The extension does not turn captions on for you."],
      ["Open the extension popup", "Use Captions, People, and Chat. Copy or download from the tab you are on. Keep mic muted stays off until you turn it on."],
    ],
    noteBefore: "Seeing a different popup status than the picture above? Use the status table on the ",
    noteLink: "support page",
    noteAfter: ".",
    promiseTitle: "Meeting notes stay in this browser",
    promiseBody:
      "Captions, names, and chat are stored on your device. The developer does not receive them and does not sell them. A profile photo is loaded only from the image address Google Meet is already showing. The extension does not read any other website.",
    promiseLink: "Read the privacy policy",
    promises: [
      "Meeting content is not sent to the developer.",
      "No analytics, no tracking cookies, and no ads.",
      "Clear Data, Chrome's extension data, or uninstall removes the local copy.",
    ],
  },
  vi: {
    kicker: "Trang chính thức",
    title: "Ghi phụ đề, danh sách người và chat của Google Meet, ngay trên trình duyệt.",
    lede: "Captions Recorder for Google Meet giữ phụ đề, danh sách người trong phòng và tin nhắn chat trên máy bạn. Mỗi dòng có tên và ảnh người đó. Phụ đề và chat xuất ra file chữ. Danh sách người xuất ra PDF, Excel hoặc PNG. Một công tắc tùy chọn sẽ tắt mic nếu mic vừa mở.",
    howTo: "Cách sử dụng",
    privacy: "Quyền riêng tư",
    caption: "Hình minh họa popup. Chữ trên sản phẩm là tiếng Anh.",
    lines: [
      { time: "09:15:04", speaker: "Alex Nguyen", text: "Xin chào mọi người đã tham gia buổi họp hôm nay." },
      { time: "09:15:18", speaker: "Minh Tran", text: "Cảm ơn anh, em xin cập nhật tiến độ tuần này." },
      { time: "09:15:31", speaker: "Alex Nguyen", text: "Mọi người xem giúp mục đang chiếu trên màn hình." },
    ],
    featuresKicker: "Tính năng",
    featuresTitle: "Việc tiện ích làm giúp bạn",
    featuresIntro: "Nó không ghi âm và không dịch. Nó giữ những gì Google Meet đang hiện, và có thể bấm nút tắt mic của Meet khi bạn bật công tắc.",
    features: [
      ["Phụ đề, kèm người nói", "Sau khi bạn bật CC, mỗi dòng giữ giờ trên máy, tên người nói, ảnh nếu Meet có hiện, và câu nói."],
      ["Người trong phòng", "Tab People liệt kê tên và ảnh. Mở People trên Meet để lấy đủ cả phòng. Tải danh sách dạng PDF, Excel hoặc PNG."],
      ["Chat trong cuộc gọi", "Tab Chat giữ tin Meet đang hiện, kèm tên, ảnh và giờ người gửi. Tải ra file .txt."],
      ["Giữ mic tắt", "Bật Keep mic muted trên popup. Mic vừa mở, kể cả bật nhầm, tiện ích bấm Tắt micrô trên Meet. Nó không ghi âm."],
      ["Sao chép hoặc tải phụ đề", "Copy All đưa bản ghi vào clipboard. Download .txt lưu meet-captions-YYYY-MM-DD.txt, mỗi câu một dòng."],
      ["Giữ riêng từng phòng họp", "Phụ đề, danh sách người và chat nằm trong bộ nhớ cục bộ của Chrome, theo mã phòng. Đóng popup không xóa. Clear Data hỏi xác nhận trước khi xóa phụ đề."],
    ],
    formatKicker: "Định dạng",
    formatTitle: "Nội dung file bạn tải về",
    formatIntro: "Mỗi dòng là một câu đã ghi. Ngày trong tên file là ngày bạn bấm tải, theo đồng hồ máy bạn.",
    log: [
      ["09:15:04", "Nguyễn An", "Xin chào mọi người đã tham gia buổi họp hôm nay."],
      ["09:15:18", "Trần Minh", "Cảm ơn anh, em xin cập nhật tiến độ tuần này."],
    ],
    stepsKicker: "Cách dùng",
    stepsTitle: "Ba bước trong cuộc họp",
    steps: [
      ["Vào phòng trên Google Meet", "Mở một cuộc họp trên meet.google.com. Nếu tab đó đã mở sẵn từ trước khi cài tiện ích, hãy tải lại bằng F5."],
      ["Bật phụ đề trên Meet", "Bấm CC, hay Phụ đề, trên thanh điều khiển của Google Meet. Tiện ích không tự bật hộ bạn."],
      ["Mở popup của tiện ích", "Dùng Captions, People và Chat. Sao chép hoặc tải từ tab đang mở. Keep mic muted chỉ chạy khi bạn bật."],
    ],
    noteBefore: "Popup báo trạng thái khác với hình trên? Xem bảng chữ trên popup ở ",
    noteLink: "trang hỗ trợ",
    noteAfter: ".",
    promiseTitle: "Nội dung họp ở lại trên trình duyệt này",
    promiseBody:
      "Phụ đề, tên và chat được lưu trên máy bạn. Nhà phát triển không nhận và không bán dữ liệu đó. Ảnh đại diện chỉ được tải từ địa chỉ ảnh Google Meet đang hiện. Tiện ích không đọc website nào khác.",
    promiseLink: "Đọc chính sách quyền riêng tư",
    promises: [
      "Nội dung cuộc họp không được gửi cho nhà phát triển.",
      "Không thống kê, không cookie theo dõi, không quảng cáo.",
      "Clear Data, xóa dữ liệu tiện ích trong Chrome, hoặc gỡ tiện ích sẽ xóa bản lưu trên máy.",
    ],
  },
}

function initials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase()
}

export function HomeView({ lang }) {
  const t = copy[lang]
  return (
    <SiteChrome lang={lang} page="home">
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="kicker">{t.kicker}</p>
            <h1>{t.title}</h1>
            <p className="lede">{t.lede}</p>
            <div className="cta">
              <Link className="btn btn-primary" href={routes.support[lang]}>
                {t.howTo}
              </Link>
              <Link className="btn btn-ghost" href={routes.privacy[lang]}>
                {t.privacy}
              </Link>
            </div>
          </div>
          <figure className="stage">
            <div className="popup" aria-hidden="true">
              <div className="pv-head">
                <div className="pv-brand">
                  <span className="mark mark-sm">
                    CC<span className="live-dot" />
                  </span>
                  <div>
                    <strong>Meet Captions</strong>
                    <em>Room: abc-defg-hij</em>
                  </div>
                </div>
                <span className="pv-count">3 lines</span>
              </div>
              <div className="pv-status">
                <span className="pv-status-main">
                  <span className="pv-dot" />
                  <b>Recording</b>
                </span>
                <span>Captions ON</span>
              </div>
              <div className="pv-mute">
                <span>Keep mic muted</span>
                <span className="pv-switch" />
              </div>
              <div className="pv-tabs">
                <span className="pv-tab pv-tab-on">Captions</span>
                <span className="pv-tab">People</span>
                <span className="pv-tab">Chat</span>
              </div>
              <div className="pv-preview">
                <div className="pv-preview-h">
                  <span>Latest Captions Preview</span>
                  <span>Real-time</span>
                </div>
                <div className="pv-list">
                  {t.lines.map((line, index) => (
                    <article className={index === t.lines.length - 1 ? "cap cap-last" : "cap"} key={line.time}>
                      <div className="pv-meta">
                        <span className="pv-avatar">{initials(line.speaker)}</span>
                        <b>{line.speaker}</b>
                        <time>[{line.time}]</time>
                      </div>
                      <p>{line.text}</p>
                    </article>
                  ))}
                </div>
              </div>
              <div className="pv-actions">
                <div className="pv-btn pv-btn-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy All
                </div>
                <div className="pv-row">
                  <div className="pv-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download .txt
                  </div>
                  <div className="pv-btn pv-btn-danger">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                    Clear Data
                  </div>
                </div>
              </div>
              <div className="pv-copy">© 2026 Hải Lập Trình</div>
            </div>
            <figcaption>{t.caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">{t.featuresKicker}</p>
            <h2>{t.featuresTitle}</h2>
            <p>{t.featuresIntro}</p>
          </div>
          <ol className="feature-list">
            {t.features.map(([title, body], index) => (
              <li key={title}>
                <span className="num">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">{t.formatKicker}</p>
            <h2>{t.formatTitle}</h2>
            <p>{t.formatIntro}</p>
          </div>
          <div className="log-card">
            {t.log.map(([time, name, text]) => (
              <p key={time}>
                <time>[{time}]</time> <b>{name}:</b> {text}
              </p>
            ))}
            <p className="log-file">meet-captions-2026-11-20.txt</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">{t.stepsKicker}</p>
            <h2>{t.stepsTitle}</h2>
          </div>
          <ol className="steps">
            {t.steps.map(([title, body], index) => (
              <li key={title}>
                <span className="step-no">{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <p className="note">
            {t.noteBefore}
            <Link href={`${routes.support[lang]}#status`}>{t.noteLink}</Link>
            {t.noteAfter}
          </p>
          <div className="promise">
            <div>
              <h2>{t.promiseTitle}</h2>
              <p>{t.promiseBody}</p>
              <Link href={routes.privacy[lang]}>{t.promiseLink}</Link>
            </div>
            <ul>
              {t.promises.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteChrome>
  )
}
