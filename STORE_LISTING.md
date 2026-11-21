# Chrome Web Store Listing Guide

Tài liệu này chứa toàn bộ nội dung chuẩn hóa để copy & dán trực tiếp lên **Chrome Web Store Developer Dashboard** nhằm tối ưu tỷ lệ duyệt nhanh ngay lần đầu.

---

## 1. Store Listing — Title & Summary

### English (Recommended Primary Listing)
- **Title (33/45 chars):**
  ```text
  Captions Recorder for Google Meet
  ```
- **Summary (90/132 chars):**
  ```text
  Save Meet captions, people, and chat on your device. Optionally keep the microphone muted.
  ```

### Tiếng Việt (Bản dịch tùy chọn / Localized Listing)
- **Tiêu đề:**
  ```text
  Ghi Phụ Đề Google Meet (Captions Recorder)
  ```
- **Mô tả ngắn (99/132 ký tự):**
  ```text
  Lưu phụ đề, danh sách người và chat của Meet trên máy bạn. Có thể giữ mic tắt khi bạn bật công tắc.
  ```

---

## 2. Detailed Description

### English (Copy & Paste)
```text
Captions Recorder for Google Meet keeps a local copy of the captions, participant list, and in-call chat already shown in your Google Meet call. You can review and export them from the popup. An optional switch keeps the microphone muted by clicking Meet's mute button. It does not record audio.

KEY FEATURES
• Captions: Reads the caption text Google Meet is showing, with the speaker name, local time, and profile photo when Meet shows one.
• People: Lists participant names and photos. Export PDF, Excel, or PNG.
• Chat: Keeps in-call messages already visible in Meet, with sender, time, and photo. Export .txt.
• Optional Keep mic muted: When you turn it on, the extension clicks Meet's "Turn off microphone" button if the mic opens. It does not record audio and does not request microphone permission.
• Local files: Copy or download captions as meet-captions-YYYY-MM-DD.txt. Clear Data asks you to confirm before deleting the current room's captions.

HOW TO USE
1. Join a meeting on https://meet.google.com/.
2. Turn on Closed Captions (CC) inside Google Meet.
3. Open the extension popup. Use Captions, People, or Chat. Turn on Keep mic muted only if you want the microphone kept off.

PRIVACY
Meeting text stays in chrome.storage.local on your device. The developer does not receive it and does not sell it. The only network request is loading a profile photo from the Google image address already shown in the meeting. The extension runs only on meet.google.com, has no analytics, and does not use remote code. Full policy: https://extension-caption-ggmeet.vercel.app/privacy

Copyright © 2026 Hải Lập Trình.
```

### Tiếng Việt (Bản dịch tham khảo / Localized Listing)
```text
Captions Recorder for Google Meet lưu trên máy bạn bản phụ đề, danh sách người và chat mà Google Meet đang hiện. Bạn xem và xuất file từ popup. Công tắc tùy chọn giữ mic tắt bằng cách bấm nút tắt mic của Meet. Tiện ích không ghi âm.

TÍNH NĂNG NỔI BẬT
• Phụ đề: Đọc chữ phụ đề Meet đang hiện, kèm tên người nói, giờ trên máy và ảnh nếu Meet có hiện.
• Danh sách người: Tên và ảnh. Xuất PDF, Excel hoặc PNG.
• Chat: Giữ tin nhắn Meet đang hiện, kèm người gửi, giờ và ảnh. Xuất .txt.
• Keep mic muted (tùy chọn): Khi bạn bật, tiện ích bấm nút "Tắt micrô" của Meet nếu mic đang mở. Không ghi âm và không xin quyền micrô.
• File trên máy: Copy hoặc tải phụ đề dạng meet-captions-YYYY-MM-DD.txt. Clear Data hỏi xác nhận trước khi xóa phụ đề của phòng hiện tại.

HƯỚNG DẪN SỬ DỤNG NHANH
1. Vào cuộc họp trên https://meet.google.com/.
2. Bật Phụ đề (CC) trong Google Meet.
3. Mở popup. Dùng Captions, People hoặc Chat. Chỉ bật Keep mic muted khi bạn muốn giữ mic tắt.

QUYỀN RIÊNG TƯ
Nội dung họp nằm trong chrome.storage.local trên máy bạn. Nhà phát triển không nhận và không bán dữ liệu đó. Request mạng duy nhất là tải ảnh đại diện từ địa chỉ ảnh Google Meet đang hiện. Tiện ích chỉ chạy trên meet.google.com, không có thống kê và không dùng mã từ máy chủ. Chính sách: https://extension-caption-ggmeet.vercel.app/privacy

Bản quyền © 2026 Hải Lập Trình.
```

---

## 3. Category & Language

- **Category:** `Productivity` (Tiếng Việt: `Năng suất`)
- **Primary Language:** `English (United States)` (có thể thêm bản địa hóa `Tiếng Việt` nếu muốn hiển thị tiếng Việt cho người dùng VN).
- **Graphic Assets cần chuẩn bị trên Dashboard:**
  - Store Icon: `icons/icon128.png` (128×128 PNG — đã có sẵn).
  - Screenshots: Chụp 1–3 ảnh màn hình kích thước `1280×800` (hoặc `640×400`) hiển thị popup đang ghi phụ đề trên Google Meet (che mờ thông tin cá nhân nếu có).
  - Small Promo Tile (tùy chọn nhưng khuyến nghị): `440×280` PNG.

---

## 4. Privacy Practices (Rất quan trọng khi gửi duyệt)

### A. Single Purpose Description
Copy & dán đoạn tiếng Anh sau vào ô **Single purpose description**:
```text
Keep a local copy of the captions, participant names, and in-call chat already shown in the current Google Meet call, and, only when the user turns it on, click Meet's mute button so the microphone stays off.
```

*(Bản dịch Tiếng Việt để tham khảo: Tự động ghi lại, chống trùng lặp, xem trước, copy và xuất phụ đề hiển thị trực tiếp trong các cuộc họp Google Meet hoàn toàn cục bộ trên trình duyệt người dùng.)*

---

### B. Permission Justifications

Copy & dán từng đoạn giải trình tương ứng cho từng quyền hiển thị trên Dashboard:

1. **`storage` justification:**
   ```text
   Used solely to store, on the user's device, caption lines, participant names, in-call chat, profile photo addresses shown by Meet, and the user's Keep mic muted on/off choice. Nothing is uploaded to the developer. The user can delete captions with Clear Data, or remove all of it by clearing the extension's Chrome data or uninstalling.
   ```

2. **`activeTab` justification:**
   ```text
   Used only when the user clicks the extension toolbar icon to check whether the active tab is a Google Meet room, read the room code from the tab URL, and communicate with the active meeting tab's content script to display live recording status, preview captions, or clear the current room's transcript.
   ```

3. **Host permission / Content Script match (`https://meet.google.com/*`) justification:**
   ```text
   Required only on https://meet.google.com/* so the content script can read the captions, participant names, and in-call chat Google Meet is already showing, and, only when the user has enabled Keep mic muted, click Meet's on-screen mute button. The extension does not run on any other website, does not record audio, and does not use remote code.
   ```

---

### C. Remote Code
- Chọn: **`No, I am not using Remote code`**
- Giải thích (nếu được hỏi):
  ```text
  All HTML, CSS, and Vanilla JavaScript files are bundled directly inside the extension package. No external scripts, eval(), remote fonts, or dynamically loaded code are used.
  ```

---

### D. Data usage and privacy policy URL
The privacy policy Google reviews is:

```text
https://extension-caption-ggmeet.vercel.app/privacy
```

Do not write that the extension collects no user data. It reads captions, names, and chat from the Meet page and stores them on the device. The policy discloses that handling, states that the developer does not receive it, and states that the only network request is loading a profile photo from the Google image address already shown in the meeting.

On the dashboard:

1. Certify all three statements that you do not sell or transfer user data, do not use it for an unrelated purpose, and do not use it for creditworthiness.
2. If a question asks whether meeting content is transmitted to the developer, answer no.
3. Privacy policy URL: `https://extension-caption-ggmeet.vercel.app/privacy`
4. Remote code: **No**. All HTML, CSS, and JavaScript ship inside the extension package. No remote scripts, `eval()`, or remotely hosted code.
