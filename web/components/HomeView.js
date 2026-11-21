import Link from "next/link"
import { SiteChrome } from "@/components/SiteChrome"
import { routes } from "@/lib/site"

const copy = {
  en: {
    kicker: "Official site",
    title: "Record Google Meet captions, in your own browser.",
    lede: "Captions Recorder for Google Meet reads the caption text shown in a meeting, separates the speaker name, stamps your local time, and keeps a transcript per room. Preview it, copy it, or download a .txt file. Captions are never sent anywhere.",
    howTo: "How to use",
    privacy: "Privacy policy",
    caption:
      "The real extension popup while it is recording. Popup labels are in English.",
    lines: [
      { time: "09:15:04", speaker: "Alex Nguyen", text: "Welcome everyone to today's sprint review." },
      { time: "09:15:18", speaker: "Minh Tran", text: "Thanks Alex, let me share the updates from this week." },
      { time: "09:15:31", speaker: "Alex Nguyen", text: "Please take a look at the item on screen." },
    ],
    featuresKicker: "Features",
    featuresTitle: "What the extension does",
    featuresIntro:
      "It does not use the microphone and it does not translate. It only keeps the caption text Google Meet is already showing.",
    features: [
      ["Read live captions", "It runs only on meet.google.com, after you turn captions on. Both the Vietnamese and English Google Meet interfaces are supported."],
      ["Split the speaker, skip duplicates", "Speaker name and spoken text are stored separately. An in-progress sentence is updated in place instead of adding a new line for every phrase."],
      ["Stamp your local time", "Each line looks like [HH:MM:SS] Speaker: Spoken text."],
      ["Preview in the popup", "Click the toolbar icon to see status, the line count, and the latest lines."],
      ["Copy or download .txt", "Copy All puts the full transcript on the clipboard. Download .txt saves meet-captions-YYYY-MM-DD.txt."],
      ["Keep each room separate", "Transcripts stay in Chrome's local storage, keyed by room code. Closing the popup does not erase them. Clear Data asks you to confirm first."],
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
      ["Open the extension popup", "Click the Chrome toolbar icon to check status, then Copy All, Download .txt, or Clear Data. Pin the icon so it stays visible."],
    ],
    noteBefore: "Seeing a different popup status than the picture above? Use the status table on the ",
    noteLink: "support page",
    noteAfter: ".",
    promiseTitle: "Your transcript stays on your device",
    promiseBody:
      "No server receives your captions. There is no usage analytics. The extension does not read any site other than Google Meet.",
    promiseLink: "Read the privacy policy",
    promises: [
      "No data is collected or sold.",
      "No tracking cookies and no ads.",
      "Delete a transcript with Clear Data, or uninstall the extension.",
    ],
  },
  vi: {
    kicker: "Trang chính thức",
    title: "Ghi phụ đề Google Meet, ngay trên trình duyệt của bạn.",
    lede: "Captions Recorder for Google Meet đọc chữ phụ đề đang hiện trong cuộc họp, tách tên người nói, gắn giờ trên máy bạn và giữ bản ghi theo từng phòng. Bạn xem trước, sao chép hoặc tải file .txt. Phụ đề không được gửi đi đâu cả.",
    howTo: "Cách sử dụng",
    privacy: "Quyền riêng tư",
    caption: "Popup thật của tiện ích khi đang ghi. Các nút và trạng thái trên popup là tiếng Anh.",
    lines: [
      { time: "09:15:04", speaker: "Alex Nguyen", text: "Xin chào mọi người đã tham gia buổi họp hôm nay." },
      { time: "09:15:18", speaker: "Minh Tran", text: "Cảm ơn anh, em xin cập nhật tiến độ tuần này." },
      { time: "09:15:31", speaker: "Alex Nguyen", text: "Mọi người xem giúp mục đang chiếu trên màn hình." },
    ],
    featuresKicker: "Tính năng",
    featuresTitle: "Việc tiện ích làm giúp bạn",
    featuresIntro: "Nó không nghe micro và không dịch. Nó chỉ lấy phần chữ Google Meet đang hiển thị.",
    features: [
      ["Đọc phụ đề trực tiếp", "Chỉ chạy trên meet.google.com, khi bạn đã bật CC. Giao diện Google Meet tiếng Việt và tiếng Anh đều dùng được."],
      ["Tách người nói, không nhân dòng", "Tên người nói và câu nói được tách riêng. Câu đang nói dở được sửa trên cùng một dòng, thay vì thêm một dòng mới cho từng cụm từ."],
      ["Gắn giờ trên máy bạn", "Mỗi dòng có dạng [HH:MM:SS] Tên người nói: Nội dung câu nói."],
      ["Xem trước trong popup", "Bấm biểu tượng trên thanh công cụ để thấy trạng thái, số dòng và các câu mới nhất."],
      ["Sao chép hoặc tải .txt", "Copy All đưa cả bản ghi vào clipboard. Download .txt lưu file meet-captions-YYYY-MM-DD.txt."],
      ["Giữ riêng từng phòng họp", "Bản ghi nằm trong bộ nhớ cục bộ của Chrome, theo mã phòng. Đóng popup không xóa nội dung. Clear Data hỏi xác nhận trước khi xóa."],
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
      ["Mở popup của tiện ích", "Bấm biểu tượng trên thanh Chrome để xem trạng thái, rồi Copy All, Download .txt hoặc Clear Data. Nên ghim biểu tượng cho dễ thấy."],
    ],
    noteBefore: "Popup báo trạng thái khác với hình trên? Xem bảng chữ trên popup ở ",
    noteLink: "trang hỗ trợ",
    noteAfter: ".",
    promiseTitle: "Dữ liệu ở lại trên máy bạn",
    promiseBody:
      "Không có máy chủ nhận phụ đề. Không có thống kê sử dụng. Tiện ích không đọc trang web nào khác ngoài Google Meet.",
    promiseLink: "Đọc chính sách quyền riêng tư",
    promises: [
      "Không thu thập và không bán dữ liệu.",
      "Không cookie theo dõi, không quảng cáo.",
      "Xóa bản ghi bằng Clear Data, hoặc gỡ tiện ích.",
    ],
  },
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
              <div className="pv-preview">
                <div className="pv-preview-h">
                  <span>Latest Captions Preview</span>
                  <span>Real-time</span>
                </div>
                <div className="pv-list">
                  {t.lines.map((line, index) => (
                    <article className={index === t.lines.length - 1 ? "cap cap-last" : "cap"} key={line.time}>
                      <div className="pv-meta">
                        <time>[{line.time}]</time> <b>{line.speaker}:</b>
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
