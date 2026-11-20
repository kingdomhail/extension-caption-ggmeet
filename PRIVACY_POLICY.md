# Privacy Policy — Captions Recorder for Google Meet

**Effective Date:** November 20, 2026  
**Developer:** Hải Lập Trình

## 1. Overview
**Captions Recorder for Google Meet** ("the Extension") is committed to protecting your privacy. The Extension is designed with a strictly local-first architecture: all caption processing and temporary storage occur exclusively inside your web browser on your own device.

## 2. Scope of Operation
The Extension operates **only** on Google Meet pages (`https://meet.google.com/*`). It does not run on, monitor, read, or interact with any other websites, browser tabs, or browsing history.

## 3. Data Collection and Transmission
- **No Data Collection:** We do **not** collect, harvest, log, or store any personal information, account details, audio, video, or meeting transcripts on any external server.
- **No Network Requests:** The Extension makes **zero** external network requests. Your captions are never transmitted to the developer or any third party.
- **No Analytics or Tracking:** The Extension contains no analytics scripts, telemetry, advertising SDKs, cookies, or tracking mechanisms.
- **No Sale or Sharing of Data:** Because we do not collect or receive any user data, we never sell, rent, or transfer user data to third parties.

## 4. Local Storage & User Control
- To prevent losing your meeting transcript when you close the extension popup or refresh your browser tab, captured caption lines (timestamp, speaker name, and caption text) are stored temporarily in your browser's local storage (`chrome.storage.local`), organized by Google Meet room code.
- This data never leaves your local browser profile.
- **Full User Control:** You can copy, download (`.txt`), or permanently delete stored captions for a meeting room at any time by clicking the **Clear ("Xóa dữ liệu")** button inside the Extension popup, or by clearing Chrome extension data / uninstalling the Extension.

## 5. Browser Permissions Explained
The Extension requests only the minimum permissions necessary to function:
- **`storage`:** Saves captured captions locally in `chrome.storage.local` per meeting room.
- **`activeTab`:** Identifies the active Google Meet room when you open the popup and communicates with the Extension's content script on that tab.
- **Content Script access to `https://meet.google.com/*`:** Observes visible caption text rendered inside Google Meet's live captions container when you enable captions (CC).

## 6. Changes to This Privacy Policy
If the Extension's privacy practices ever change in future updates, this Privacy Policy will be updated accordingly along with the effective date at the top of this document.

## 7. Contact
If you have any questions about this Privacy Policy or the Extension, please contact:
- **Developer:** Hải Lập Trình
- **Support / Contact:** *[kingdomhail.dev@gmail.com]*

---
© 2026 Hải Lập Trình. All rights reserved.
