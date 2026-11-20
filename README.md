# Captions Recorder for Google Meet (Chrome Extension - Manifest V3)

Extension Chrome gọn nhẹ viết hoàn toàn bằng Vanilla JavaScript, HTML và CSS giúp tự động ghi lại, chống trùng lặp, xem trước, copy và xuất phụ đề (Captions) trên Google Meet theo thời gian thực.

## Tính năng chính
- Tự động theo dõi phụ đề trên `https://meet.google.com/*` bằng `MutationObserver` (hỗ trợ cả giao diện **Tiếng Việt** lẫn **Tiếng Anh** và có selector dự phòng).
- Tách chính xác **Tên người nói** và **Nội dung câu nói**, tự động cập nhật câu đang nói dở để không bị trùng lặp.
- Gắn mốc thời gian địa phương dạng `[HH:MM:SS] Tên người nói: Nội dung câu nói`.
- Lưu tạm dữ liệu theo từng mã phòng họp trong `chrome.storage.local`, xử lý **100% cục bộ** trên trình duyệt.
- Hỗ trợ **Copy toàn bộ**, **Tải file `.txt`** (`meet-captions-YYYY-MM-DD.txt`) và **Xóa dữ liệu**.

## Cấu trúc thư mục
```text
extension-caption-ggmeet/
├── manifest.json
├── content.js
├── popup.html
├── popup.css
├── popup.js
├── icon.svg
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   └── generate-icons.ps1
├── build-zip.ps1
├── STORE_LISTING.md
├── PRIVACY_POLICY.md
└── README.md
```

## Hướng dẫn cài đặt thử nghiệm (Load Unpacked trên Chrome)
1. Mở trình duyệt Google Chrome và truy cập: `chrome://extensions/`
2. Bật **Developer mode (Chế độ dành cho nhà phát triển)** ở góc trên bên phải.
3. Nhấn **Load unpacked (Tải tiện ích đã giải nén)** và chọn thư mục `extension-caption-ggmeet`.
4. Ghim (Pin) biểu tượng extension lên thanh công cụ để tiện sử dụng.

## Xuất Icon & Đóng gói phát hành Chrome Web Store
- **Tạo lại bộ icon PNG (`16`, `48`, `128`) đồng bộ với `icon.svg`:**
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\generate-icons.ps1
  ```
- **Đóng gói file `extension-release.zip` chuẩn upload Chrome Web Store:**
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\build-zip.ps1
  ```
  Script sẽ kiểm tra `manifest.json`, chỉ nén các file chạy cần thiết (tự động loại trừ `.git`, `README.md`, `STORE_LISTING.md`, `PRIVACY_POLICY.md`, `icon.svg`, script đóng gói...) và đặt `manifest.json` ngay tại thư mục gốc của file `.zip`.
- **Nội dung điền trên Chrome Web Store Dashboard:** xem file `STORE_LISTING.md`.
- **Chính sách quyền riêng tư (host lên GitHub Pages):** xem file `PRIVACY_POLICY.md`.

## Cách sử dụng
1. Truy cập một phòng họp trên `https://meet.google.com/...` (nếu tab đã mở sẵn trước khi cài extension, hãy tải lại trang bằng `F5`).
2. Bật tính năng **Phụ đề (CC)** trong Google Meet.
3. Nhấn vào biểu tượng extension trên thanh công cụ để xem trạng thái ghi, xem trước nội dung mới nhất, **Copy toàn bộ**, **Tải file .txt** hoặc **Xóa dữ liệu**.

## Bản quyền
© 2026 **Hải Lập Trình**. Bảo lưu mọi quyền.
