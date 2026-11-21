# Privacy Policy — Captions Recorder for Google Meet

**Effective Date:** November 21, 2026  
**Developer:** Hải Lập Trình  
**Public policy:** https://extension-caption-ggmeet.vercel.app/privacy

## 1. Overview
**Captions Recorder for Google Meet** ("the Extension") keeps a local copy of what the current Google Meet call is already showing. Processing and storage happen in the browser on your device. The developer does not receive that information.

## 2. Scope of Operation
The Extension runs only on Google Meet pages (`https://meet.google.com/*`). It does not run on, monitor, or read any other website, browser tab, or browsing history.

## 3. Information handled on your device
While a Google Meet call is open, the Extension reads information Meet is already showing and stores it in `chrome.storage.local` on that device:

- Caption lines: local time, speaker name, spoken text, and the profile photo address when Meet shows one.
- Participant names, and the profile photo address when Meet shows one.
- In-call chat: sender name, time, message text, and the profile photo address when Meet shows one.
- Whether **Keep mic muted** is on. This choice is stored on the device and is not tied to one room.

The developer does not receive, log, or store this information on any server. It is not sold, rented, or transferred to a third party. The Extension has no analytics, advertising, or tracking.

To show a profile photo, the popup loads that image from the Google address already displayed in the meeting. That is the only network request the Extension causes. If the image does not load, the popup shows the person's initials.

## 4. Microphone
The Extension does not request microphone permission and does not record audio. **Keep mic muted** stays off until you turn it on. When it is on, the Extension clicks the mute control Google Meet is already showing ("Turn off microphone" or "Tắt micrô") so an open microphone is turned off again.

## 5. Your control
**Clear Data** deletes the caption transcript for the current room after you confirm. Captions, participant names, chat, photo addresses, and the mute setting are removed when you clear the Extension's data in Chrome or uninstall the Extension.

## 6. Browser Permissions
- **`storage`:** saves the information listed above in `chrome.storage.local` on your device.
- **`activeTab`:** when you open the popup, checks that the current tab is a Google Meet room and talks to the content script on that tab.
- **Content script on `https://meet.google.com/*` only:** reads the captions, participant list, and in-call chat Meet is showing. When Keep mic muted is on, it clicks Meet's mute button. It does not run on any other site and does not use remotely hosted code.

## 7. Changes to This Privacy Policy
If these practices change, this policy and the page at https://extension-caption-ggmeet.vercel.app/privacy will be updated, and the effective date will change.

## 8. Contact
- **Developer:** Hải Lập Trình
- **Support:** kingdomhail.dev@gmail.com
- **Facebook:** https://www.facebook.com/kingdomhail.dev

---
© 2026 Hải Lập Trình. All rights reserved.
