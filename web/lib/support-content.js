export const supportCopy = {
  en: {
    kicker: "Support",
    title: "When captions are not showing in the popup",
    lede: "This page is for people using Captions Recorder for Google Meet, version 1.1.0. Most cases are captions still off, or a Meet tab that was open before the extension was installed.",
    useTitle: "How to use it",
    steps: [
      ["Install in Chrome and pin the icon", "The extension runs in Google Chrome. After installing, pin the CC icon to the toolbar so you do not have to open the extensions menu."],
      ["Join a room and turn captions on", "Open the meeting at meet.google.com and click Captions (CC). If the tab was open before installation, press F5 once."],
      ["Open the popup when you need the text", "Captions has Copy All, Download .txt, and Clear Data. People downloads PDF, Excel, or PNG. Chat downloads a .txt file. Keep mic muted is off until you turn it on."],
    ],
    statusTitle: "What the popup is saying",
    statusIntro: "Popup text is English. The first column is the exact pair you see: the status line, then the hint on the right.",
    columns: ["On the popup", "It means", "What to do"],
    rows: [
      {
        codes: ["Recording", "Captions ON"],
        meaning: "Captions in this room are being read. The room badge looks like `Room: room-code`.",
        action: "Leave the meeting running. Open the popup when you want to preview, copy, or download.",
      },
      {
        codes: ["Captions Off", "Click CC in Meet"],
        meaning: "You are in a meeting room, but Google Meet is not showing captions.",
        action: "Click CC or Captions in the Google Meet bar. Wait until a line appears, then check the popup again.",
      },
      {
        codes: ["Page not connected", "Reload (F5) Meet tab"],
        meaning: "The Meet tab is not attached to the extension. This is common if the tab was open before installation, or was restored.",
        action: "Press F5 on the meeting tab, then click the extension icon again.",
      },
      {
        codes: ["Not in a meeting", "Join a meeting to record"],
        meaning: "The Meet tab has no room code. The badge still says `Google Meet Home`, including while you are on the new-meeting page or another Meet page.",
        action: "Join a meeting whose room code is in the address bar. Meet pages without a room code are not recorded.",
      },
      {
        codes: ["Captions Off", "Not on Meet tab"],
        meaning: "The current tab is not Meet. The badge `Last room: room-code` is the most recent room still saved on this device.",
        action: "Return to the meeting tab to keep recording. You can still copy or download what was saved.",
      },
      {
        codes: ["Captions Off", "Open meet.google.com"],
        meaning: "No meeting is open and there is no local transcript yet. The badge says `Google Meet not open`.",
        actionBefore: "Open ",
        actionAfter: " and join a meeting.",
      },
    ],
    faqTitle: "Common questions",
    faqs: [
      {
        q: "Does it translate or record audio?",
        a: [
          "No. The extension does not record audio and it does not translate. Captions are the text Google Meet is already drawing on screen.",
          "Keep mic muted is optional. When it is on, the extension clicks Meet's Turn off microphone button if the mic opens. It still does not record sound.",
          "To get captions in another language, turn on captions or translation inside Google Meet. Whatever text Meet shows is the text that gets saved.",
        ],
      },
      {
        q: "Why does a long sentence change on the same line?",
        a: ["Google Meet reveals a sentence gradually. The extension updates that same line until the utterance or the speaker changes, so the transcript does not repeat every fragment."],
      },
      {
        q: "Is an older room's transcript still there?",
        a: [
          "Yes, unless you cleared it or removed the extension's Chrome data. Each room code has its own transcript in `chrome.storage.local` on your device.",
          "Open that same room and click the icon to continue. On another tab, the popup can show `Last room` with the saved transcript.",
        ],
      },
      {
        q: "How do I delete a transcript?",
        a: [
          "Click `Clear Data`. For about 3 seconds the button changes to `Confirm clear?`. Click it again to delete the selected room's transcript. If you wait out the 3 seconds, the button returns to normal and nothing is deleted.",
          "The button stays disabled until there is at least one line.",
        ],
      },
      {
        q: "Where does the .txt file go?",
        a: ["Chrome saves it through the browser download shelf. Caption files are named `meet-captions-YYYY-MM-DD.txt`. Chat files are `meet-chat-YYYY-MM-DD.txt`. People files use the same date with `.pdf`, `.xlsx`, or `.png`. The date is the day you download, on your computer's clock."],
      },
      {
        q: "Which permissions does it ask for?",
        list: [
          "`storage` — saves captions, participant names, profile photo addresses, and chat on the device, per room code.",
          "`activeTab` — when you click the icon, checks whether the current tab is a Meet room and talks to the script on that tab.",
          "The content script is attached only to `https://meet.google.com/*`. It reads visible captions, the participant list, and in-call chat, and it can click the microphone button when Keep mic muted is on.",
        ],
      },
      {
        q: "Does uninstalling remove the transcript?",
        a: ["Uninstalling the extension, or clearing its data in Chrome, removes the local transcript. There is no server copy, because the text was never uploaded."],
      },
      {
        q: "What if Meet changes and capture stops?",
        a: ["Reload the meeting tab with F5 first. If the popup still says `Captions Off` while you can see captions in Meet, email support. Include whether the Meet interface is Vietnamese or English, and copy the exact popup status line."],
      },
    ],
    contactTitle: "Still need a person to look",
    contactBody: "Write to Hải Lập Trình. Include the popup status line, the Meet interface language, and whether captions were on and the tab was reloaded.",
    contactButton: "Email support",
  },
  vi: {
    kicker: "Hỗ trợ",
    title: "Khi phụ đề chưa hiện trong popup",
    lede: "Trang này dành cho người đang dùng Captions Recorder for Google Meet, phiên bản 1.1.0. Phần lớn trường hợp là chưa bật CC, hoặc tab Meet được mở trước khi cài tiện ích.",
    useTitle: "Cách dùng",
    steps: [
      ["Cài trên Chrome và ghim biểu tượng", "Tiện ích chạy trên Google Chrome. Sau khi cài, ghim biểu tượng CC lên thanh công cụ để khỏi phải đi tìm trong menu tiện ích."],
      ["Vào phòng và bật phụ đề", "Mở cuộc họp tại meet.google.com rồi bấm Phụ đề (CC). Nếu tab đã mở từ trước khi cài, bấm F5 một lần."],
      ["Mở popup khi cần lấy chữ", "Captions có Copy All, Download .txt và Clear Data. People tải PDF, Excel hoặc PNG. Chat tải file .txt. Keep mic muted chỉ chạy khi bạn bật."],
    ],
    statusTitle: "Popup đang nói gì",
    statusIntro: "Chữ trên popup là tiếng Anh. Cột đầu tiên là đúng cụm bạn nhìn thấy: dòng trạng thái, rồi dòng gợi ý bên phải.",
    columns: ["Trên popup", "Nghĩa là", "Việc nên làm"],
    rows: [
      {
        codes: ["Recording", "Captions ON"],
        meaning: "Đang đọc được phụ đề trong phòng này. Huy hiệu phòng có dạng `Room: mã-phòng`.",
        action: "Cứ để cuộc họp chạy. Mở popup khi muốn xem, sao chép hoặc tải file.",
      },
      {
        codes: ["Captions Off", "Click CC in Meet"],
        meaning: "Bạn đang ở trong phòng họp, nhưng Google Meet chưa hiện phụ đề.",
        action: "Bấm CC hoặc Phụ đề trên thanh của Google Meet. Đợi một câu nói hiện ra rồi xem lại popup.",
      },
      {
        codes: ["Page not connected", "Reload (F5) Meet tab"],
        meaning: "Tab Meet chưa gắn với tiện ích. Hay gặp khi tab mở sẵn trước lúc cài, hoặc vừa được khôi phục.",
        action: "Bấm F5 trên tab cuộc họp, sau đó bấm lại biểu tượng tiện ích.",
      },
      {
        codes: ["Not in a meeting", "Join a meeting to record"],
        meaning: "Tab Meet không có mã phòng. Huy hiệu vẫn ghi `Google Meet Home`, kể cả lúc bạn đang ở trang tạo cuộc họp hay một trang Meet khác.",
        action: "Vào một cuộc họp có mã phòng trên thanh địa chỉ. Những trang Meet không có mã phòng sẽ không được ghi.",
      },
      {
        codes: ["Captions Off", "Not on Meet tab"],
        meaning: "Tab hiện tại không phải Meet. Huy hiệu `Last room: mã-phòng` là phòng ghi gần nhất còn lưu trên máy.",
        action: "Quay lại tab cuộc họp để ghi tiếp. Bạn vẫn copy hoặc tải được bản đã lưu.",
      },
      {
        codes: ["Captions Off", "Open meet.google.com"],
        meaning: "Không có phòng nào đang mở và cũng chưa có bản ghi cục bộ. Huy hiệu ghi `Google Meet not open`.",
        actionBefore: "Mở ",
        actionAfter: " và vào một cuộc họp.",
      },
    ],
    faqTitle: "Câu hỏi thường gặp",
    faqs: [
      {
        q: "Tiện ích có dịch hoặc ghi âm không?",
        a: [
          "Không. Tiện ích không ghi âm và không dịch. Phụ đề là chữ Google Meet đang hiện trên màn hình.",
          "Keep mic muted là tùy chọn. Khi bật, tiện ích bấm nút Tắt micrô của Meet nếu mic vừa mở. Nó vẫn không ghi âm.",
          "Muốn có phụ đề ngôn ngữ khác thì bật phụ đề hoặc bản dịch ngay trong Google Meet. Chữ nào Meet hiện, tiện ích ghi chữ đó.",
        ],
      },
      {
        q: "Vì sao một câu dài bị sửa trên cùng một dòng?",
        a: ["Google Meet hiện câu dần dần. Tiện ích cập nhật đúng dòng đó cho đến khi sang câu hoặc người nói khác, nên bản ghi không bị lặp từng mảnh câu."],
      },
      {
        q: "Bản ghi của phòng cũ còn không?",
        a: [
          "Còn, nếu bạn chưa xóa và chưa xóa dữ liệu tiện ích của Chrome. Mỗi mã phòng một bản ghi, lưu trong `chrome.storage.local` trên máy bạn.",
          "Mở lại đúng phòng rồi bấm biểu tượng để xem tiếp. Nếu bạn đang đứng ở tab khác, popup có thể hiện `Last room` cùng bản đã lưu.",
        ],
      },
      {
        q: "Xóa dữ liệu như thế nào?",
        a: [
          "Bấm `Clear Data`. Trong khoảng 3 giây, nút đổi thành `Confirm clear?`. Bấm lần nữa để xóa bản ghi của phòng đang chọn. Hết 3 giây mà chưa bấm, nút trở lại như cũ và không xóa gì.",
          "Nút chỉ bấm được khi đã có ít nhất một dòng.",
        ],
      },
      {
        q: "File tải về nằm ở đâu?",
        a: ["Chrome lưu qua khung tải xuống của trình duyệt. File phụ đề là `meet-captions-YYYY-MM-DD.txt`. File chat là `meet-chat-YYYY-MM-DD.txt`. Danh sách người dùng cùng ngày với đuôi `.pdf`, `.xlsx` hoặc `.png`. Ngày là ngày bạn bấm tải, theo giờ máy bạn."],
      },
      {
        q: "Tiện ích xin những quyền nào?",
        list: [
          "`storage` — lưu phụ đề, tên người, địa chỉ ảnh và chat trên máy, theo mã phòng.",
          "`activeTab` — khi bạn bấm biểu tượng, nhận ra tab hiện tại có phải phòng Meet hay không và nói chuyện với script trên tab đó.",
          "Script nội dung chỉ gắn vào `https://meet.google.com/*`. Nó đọc phụ đề, danh sách người và chat đang hiện, và có thể bấm nút mic khi bạn bật Keep mic muted.",
        ],
      },
      {
        q: "Gỡ tiện ích thì bản ghi còn không?",
        a: ["Gỡ tiện ích, hoặc xóa dữ liệu của tiện ích trong Chrome, sẽ xóa bản ghi cục bộ. Không có bản sao trên máy chủ, vì nội dung chưa từng được gửi đi."],
      },
      {
        q: "Meet đổi giao diện và không ghi nữa thì sao?",
        a: ["Tải lại tab cuộc họp bằng F5 trước. Nếu popup vẫn là `Captions Off` trong khi bạn đang thấy phụ đề trên Meet, gửi email hỗ trợ. Cho biết giao diện Meet đang là tiếng Việt hay tiếng Anh, và chép đúng dòng trạng thái trên popup."],
      },
    ],
    contactTitle: "Vẫn cần người xem giúp",
    contactBody: "Viết cho Hải Lập Trình. Kèm dòng trạng thái trên popup, ngôn ngữ giao diện Meet, và bạn đã bật CC cùng F5 chưa.",
    contactButton: "Gửi email hỗ trợ",
  },
}

export function faqAnswerText(item) {
  const parts = [...(item.a || []), ...(item.list || [])]
  return parts.join(" ").replace(/`/g, "")
}
