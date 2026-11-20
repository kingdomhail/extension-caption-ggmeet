# Chrome Web Store Listing Guide

Tài liệu này chứa toàn bộ nội dung chuẩn hóa để copy & dán trực tiếp lên **Chrome Web Store Developer Dashboard** nhằm tối ưu tỷ lệ duyệt nhanh ngay lần đầu.

---

## 1. Store Listing — Title & Summary

### English (Recommended Primary Listing)
- **Title (33/45 chars):**
  ```text
  Captions Recorder for Google Meet
  ```
- **Summary (101/132 chars):**
  ```text
  Capture, preview, copy, and export live Google Meet captions with timestamps locally in your browser.
  ```

### Tiếng Việt (Bản dịch tùy chọn / Localized Listing)
- **Tiêu đề:**
  ```text
  Ghi Phụ Đề Google Meet (Captions Recorder)
  ```
- **Mô tả ngắn (115/132 ký tự):**
  ```text
  Tự động ghi, xem trước, copy và xuất phụ đề Google Meet kèm mốc thời gian ngay trên trình duyệt, không gửi dữ liệu.
  ```

---

## 2. Detailed Description

### English (Copy & Paste)
```text
Captions Recorder for Google Meet is a lightweight, privacy-first Chrome extension that automatically captures live closed captions during your Google Meet calls so you can review, copy, or export clean meeting notes in one click.

KEY FEATURES
• Real-time Caption Capture: Automatically observes Google Meet's live captions region (supports both English and Vietnamese Google Meet interfaces).
• Smart Speaker & Deduplication Engine: Accurately separates speaker names from spoken text and updates in-progress sentences cleanly instead of creating duplicate lines for every word.
• Local Timestamps: Automatically tags each utterance with your local time in clean [HH:MM:SS] Speaker: Text format.
• Live Popup Preview: Check recording status ("Recording" / "Captions Off"), line count, and real-time transcript preview anytime.
• One-Click Export:
  - Copy entire transcript to clipboard in [HH:MM:SS] Speaker: Text format.
  - Download transcript directly as a plain text file (meet-captions-YYYY-MM-DD.txt).
  - Clear transcript data safely with two-step confirmation.
• Per-Room Local Persistence: Captions are stored temporarily by meeting room code in chrome.storage.local, so closing the popup never loses your meeting transcript.

OUTPUT FORMAT EXAMPLE
[09:15:04] Alex Nguyen: Welcome everyone to today's sprint review.
[09:15:18] Minh Tran: Thanks Alex, let me share the updates from this week.

HOW TO USE
1. Join any meeting on https://meet.google.com/.
2. Turn on Closed Captions (CC) inside Google Meet.
3. Click the extension icon on your Chrome toolbar to preview, copy, or download your transcript as a .txt file.

100% LOCAL & PRIVACY-FIRST
This extension runs entirely inside your browser. It does not collect personal information, does not use analytics or tracking scripts, and never sends your meeting captions to any external server.

Copyright © 2026 Hải Lập Trình.
```

### Tiếng Việt (Bản dịch tham khảo / Localized Listing)
```text
Captions Recorder for Google Meet là tiện ích Chrome siêu nhẹ, bảo mật tuyệt đối giúp bạn tự động ghi lại phụ đề (Captions) trên Google Meet theo thời gian thực để dễ dàng xem lại, copy hoặc xuất biên bản cuộc họp chỉ với một cú nhấp chuột.

TÍNH NĂNG NỔI BẬT
• Ghi phụ đề theo thời gian thực: Tự động theo dõi vùng phụ đề trực tiếp trên Google Meet (hỗ trợ cả giao diện Tiếng Việt và Tiếng Anh).
• Tách người nói & chống trùng lặp thông minh: Tự tách chính xác Tên người nói và Nội dung câu nói, cập nhật câu đang nói dở mà không tạo hàng loạt dòng trùng lặp.
• Gắn mốc thời gian chuẩn: Xuất nội dung sạch đẹp theo định dạng [HH:MM:SS] Tên người nói: Nội dung câu nói.
• Xem trước trực tiếp trong Popup: Theo dõi trạng thái ghi (Đang ghi / Chưa bật phụ đề), số dòng đã thu thập và nội dung mới nhất.
• Xuất & quản lý nhanh:
  - Copy toàn bộ nội dung vào Clipboard chỉ bằng 1 click.
  - Tải file văn bản meet-captions-YYYY-MM-DD.txt.
  - Xóa dữ liệu an toàn với xác nhận 2 bước.
• Lưu tạm theo từng mã phòng họp: Lưu trên chrome.storage.local nên không bị mất dữ liệu nếu bạn đóng popup trong lúc họp.

VÍ DỤ ĐỊNH DẠNG XUẤT RA
[09:15:04] Nguyễn Văn A: Xin chào mọi người đã tham gia buổi họp hôm nay.
[09:15:18] Trần Thị B: Cảm ơn anh, em xin phép cập nhật tiến độ tuần này.

HƯỚNG DẪN SỬ DỤNG NHANH
1. Tham gia một cuộc họp trên https://meet.google.com/.
2. Bật nút Phụ đề (CC) trong giao diện Google Meet.
3. Nhấn vào biểu tượng extension trên thanh công cụ Chrome để xem trước, copy hoặc tải file .txt.

CAM KẾT XỬ LÝ 100% CỤC BỘ
Extension hoạt động hoàn toàn trên trình duyệt của bạn, không thu thập dữ liệu cá nhân, không theo dõi người dùng và tuyệt đối không gửi nội dung cuộc họp ra bất kỳ máy chủ bên ngoài nào.

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
Capture, deduplicate, preview, copy, and export live closed captions displayed in Google Meet meetings locally within the user's browser.
```

*(Bản dịch Tiếng Việt để tham khảo: Tự động ghi lại, chống trùng lặp, xem trước, copy và xuất phụ đề hiển thị trực tiếp trong các cuộc họp Google Meet hoàn toàn cục bộ trên trình duyệt người dùng.)*

---

### B. Permission Justifications

Copy & dán từng đoạn giải trình tương ứng cho từng quyền hiển thị trên Dashboard:

1. **`storage` justification:**
   ```text
   Used solely to temporarily persist captured meeting captions per Google Meet room ID in chrome.storage.local so users do not lose their transcript when closing or reopening the extension popup or refreshing the meeting tab. All data remains strictly on the user's local device and can be deleted at any time using the Clear button.
   ```

2. **`activeTab` justification:**
   ```text
   Used only when the user clicks the extension toolbar icon to check whether the active tab is a Google Meet room, read the room code from the tab URL, and communicate with the active meeting tab's content script to display live recording status, preview captions, or clear the current room's transcript.
   ```

3. **Host permission / Content Script match (`https://meet.google.com/*`) justification:**
   ```text
   Required strictly so the content script can attach a MutationObserver to Google Meet's live captions container on https://meet.google.com/* pages to read visible speaker names and caption text in real time. The extension does not run on or access any other website.
   ```

---

### C. Remote Code
- Chọn: **`No, I am not using Remote code`**
- Giải thích (nếu được hỏi):
  ```text
  All HTML, CSS, and Vanilla JavaScript files are bundled directly inside the extension package. No external scripts, eval(), remote fonts, or dynamically loaded code are used.
  ```

---

### D. Data Usage (Hướng dẫn tích chọn trên Dashboard)
1. **What user data do you plan to collect from users now or in the future?**
   - **KHÔNG tích chọn bất kỳ ô nào** trong danh sách loại dữ liệu thu thập (Personally identifiable information, Health info, Website content, v.v.), vì toàn bộ phụ đề chỉ xử lý & lưu tạm cục bộ trên máy người dùng và **không bao giờ** truyền về máy chủ của nhà phát triển.
2. **Certify the following disclosures (Tích chọn cả 3 ô cam kết bắt buộc):**
   - `[x]` I do not sell or transfer user data to third parties, outside of the approved use cases.
   - `[x]` I do not use or transfer user data for purposes that are unrelated to the item's single purpose.
   - `[x]` I do not use or transfer user data to determine creditworthiness or for lending purposes.
3. **Privacy Policy URL:**
   - Upload file `PRIVACY_POLICY.md` lên GitHub repository (hoặc bật GitHub Pages) và dán link công khai vào ô **Privacy policy URL**.
