/*!
 * Google Meet Captions Recorder - Popup Script
 * Copyright (c) 2026 Hải Lập Trình. All rights reserved.
 */
(() => {
  'use strict';

  const STORAGE_PREFIX = 'meet_captions_';
  const LAST_ROOM_KEY = 'meet_captions_last_room';
  const MAX_PREVIEW_ITEMS = 120;
  const IGNORED_PATH_SEGMENTS = new Set([
    'landing',
    'new',
    'lookup',
    'about',
    'calling',
    'whoops',
    '_meet'
  ]);

  // DOM Elements
  const roomBadgeEl = document.getElementById('roomBadge');
  const lineCountEl = document.getElementById('lineCount');
  const statusDotEl = document.getElementById('statusDot');
  const statusTextEl = document.getElementById('statusText');
  const statusHintEl = document.getElementById('statusHint');
  const captionListEl = document.getElementById('captionList');
  const emptyStateEl = document.getElementById('emptyState');
  const copyBtn = document.getElementById('copyBtn');
  const copyBtnLabel = document.getElementById('copyBtnLabel');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const clearBtnLabel = document.getElementById('clearBtnLabel');
  const toastEl = document.getElementById('toast');

  // State
  let activeTabId = null;
  let isOnMeetTab = false;
  let activeRoomId = null;
  let currentEntries = [];
  let isRecording = false;
  let needsReloadHint = false;
  let clearConfirmTimer = null;
  let toastTimer = null;
  let copyFeedbackTimer = null;

  /**
   * Trích xuất mã phòng họp từ URL Google Meet
   */
  function getRoomIdFromUrl(urlString) {
    if (!urlString) return null;
    try {
      const url = new URL(urlString);
      if (url.hostname !== 'meet.google.com') return null;
      const cleanPath = url.pathname.replace(/^\/+|\/+$/g, '');
      if (!cleanPath) return null;
      const firstSegment = cleanPath.split('/')[0];
      if (!firstSegment || IGNORED_PATH_SEGMENTS.has(firstSegment.toLowerCase())) {
        return null;
      }
      return firstSegment;
    } catch {
      return null;
    }
  }

  /**
   * Định dạng toàn bộ danh sách phụ đề theo chuẩn:
   * [HH:MM:SS] Tên người nói: Nội dung câu nói
   */
  function formatTranscript(entries) {
    return entries
      .map((item) => `[${item.timestamp}] ${item.speaker}: ${item.text}`)
      .join('\n');
  }

  /**
   * Tạo tên file tải xuống: meet-captions-YYYY-MM-DD.txt
   */
  function buildFileName() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    return `meet-captions-${yyyy}-${mm}-${dd}.txt`;
  }

  /**
   * Hiển thị thông báo toast gọn gàng
   */
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2200);
  }

  /**
   * Cập nhật trạng thái UI (đèn trạng thái, bộ đếm dòng, phòng họp, nút chức năng)
   */
  function renderStatus() {
    const count = currentEntries.length;
    lineCountEl.textContent = `${count} dòng`;

    const hasEntries = count > 0;
    copyBtn.disabled = !hasEntries;
    downloadBtn.disabled = !hasEntries;
    clearBtn.disabled = !hasEntries;

    if (isOnMeetTab && activeRoomId) {
      roomBadgeEl.textContent = `Phòng: ${activeRoomId}`;
      if (needsReloadHint) {
        statusDotEl.className = 'status-dot idle';
        statusTextEl.textContent = 'Chưa kết nối trang';
        statusHintEl.textContent = 'Tải lại (F5) tab Meet';
      } else if (isRecording) {
        statusDotEl.className = 'status-dot recording';
        statusTextEl.textContent = 'Đang ghi';
        statusHintEl.textContent = 'Phụ đề đang bật';
      } else {
        statusDotEl.className = 'status-dot idle';
        statusTextEl.textContent = 'Chưa bật phụ đề';
        statusHintEl.textContent = 'Nhấn CC trên Meet';
      }
    } else if (isOnMeetTab && !activeRoomId) {
      roomBadgeEl.textContent = 'Trang chủ Google Meet';
      statusDotEl.className = 'status-dot offline';
      statusTextEl.textContent = 'Chưa vào phòng họp';
      statusHintEl.textContent = 'Tham gia cuộc họp để ghi';
    } else if (activeRoomId) {
      roomBadgeEl.textContent = `Phòng gần nhất: ${activeRoomId}`;
      statusDotEl.className = 'status-dot offline';
      statusTextEl.textContent = 'Chưa bật phụ đề';
      statusHintEl.textContent = 'Không ở tab Meet';
    } else {
      roomBadgeEl.textContent = 'Chưa mở Google Meet';
      statusDotEl.className = 'status-dot offline';
      statusTextEl.textContent = 'Chưa bật phụ đề';
      statusHintEl.textContent = 'Mở meet.google.com';
    }
  }

  /**
   * Render danh sách phụ đề xem trước (tự cuộn xuống cuối nếu đang ở gần đáy)
   */
  function renderCaptions() {
    const isNearBottom =
      captionListEl.scrollHeight - captionListEl.scrollTop - captionListEl.clientHeight < 48;

    if (currentEntries.length === 0) {
      captionListEl.innerHTML = '';
      captionListEl.appendChild(emptyStateEl);
      return;
    }

    const previewItems = currentEntries.slice(-MAX_PREVIEW_ITEMS);
    const fragment = document.createDocumentFragment();

    for (const item of previewItems) {
      const card = document.createElement('div');
      card.className = 'caption-item';

      const meta = document.createElement('div');
      meta.className = 'caption-meta';

      const timeSpan = document.createElement('span');
      timeSpan.className = 'caption-time';
      timeSpan.textContent = `[${item.timestamp}]`;

      const speakerSpan = document.createElement('span');
      speakerSpan.className = 'caption-speaker';
      speakerSpan.textContent = `${item.speaker}:`;

      meta.appendChild(timeSpan);
      meta.appendChild(speakerSpan);

      const textDiv = document.createElement('div');
      textDiv.className = 'caption-text';
      textDiv.textContent = item.text;

      card.appendChild(meta);
      card.appendChild(textDiv);
      fragment.appendChild(card);
    }

    captionListEl.innerHTML = '';
    captionListEl.appendChild(fragment);

    if (isNearBottom) {
      captionListEl.scrollTop = captionListEl.scrollHeight;
    }
  }

  function renderAll() {
    renderStatus();
    renderCaptions();
  }

  /**
   * Đọc dữ liệu phòng họp từ chrome.storage.local
   */
  function loadRoomFromStorage(roomId) {
    return new Promise((resolve) => {
      if (!roomId) {
        resolve(null);
        return;
      }
      const key = `${STORAGE_PREFIX}${roomId}`;
      chrome.storage.local.get([key], (res) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(res[key] || null);
      });
    });
  }

  /**
   * Gửi message tới content script trên tab Google Meet
   */
  function sendMessageToTab(tabId, payload) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, payload, (response) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(response || null);
      });
    });
  }

  /**
   * Copy chuỗi vào clipboard (có fallback execCommand nếu cần)
   */
  async function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Thử fallback bên dưới
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }

  /**
   * Đặt lại trạng thái nút xác nhận xóa
   */
  function resetClearConfirm() {
    if (clearConfirmTimer) {
      clearTimeout(clearConfirmTimer);
      clearConfirmTimer = null;
    }
    clearBtn.classList.remove('confirming');
    clearBtnLabel.textContent = 'Xóa dữ liệu';
  }

  /**
   * Sự kiện nút Copy toàn bộ
   */
  copyBtn.addEventListener('click', async () => {
    if (currentEntries.length === 0) return;
    const text = formatTranscript(currentEntries);
    const copied = await copyTextToClipboard(text);
    if (copied) {
      copyBtn.classList.add('copied');
      copyBtnLabel.textContent = 'Đã copy!';
      showToast('Đã copy toàn bộ phụ đề');
      if (copyFeedbackTimer) clearTimeout(copyFeedbackTimer);
      copyFeedbackTimer = setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtnLabel.textContent = 'Copy toàn bộ';
      }, 1800);
    } else {
      showToast('Không thể copy vào Clipboard');
    }
  });

  /**
   * Sự kiện nút Tải file .txt
   */
  downloadBtn.addEventListener('click', () => {
    if (currentEntries.length === 0) return;
    const content = formatTranscript(currentEntries);
    const fileName = buildFileName();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast(`Đã tải ${fileName}`);
  });

  /**
   * Sự kiện nút Xóa dữ liệu (xác nhận 2 bước gọn trong nút để tránh lỡ tay)
   */
  clearBtn.addEventListener('click', async () => {
    if (currentEntries.length === 0) return;

    if (!clearBtn.classList.contains('confirming')) {
      clearBtn.classList.add('confirming');
      clearBtnLabel.textContent = 'Xác nhận xóa?';
      clearConfirmTimer = setTimeout(resetClearConfirm, 3000);
      return;
    }

    resetClearConfirm();

    if (isOnMeetTab && activeTabId !== null && !needsReloadHint) {
      await sendMessageToTab(activeTabId, { type: 'CLEAR_CAPTIONS' });
    }

    if (activeRoomId) {
      const key = `${STORAGE_PREFIX}${activeRoomId}`;
      chrome.storage.local.set({
        [key]: {
          roomId: activeRoomId,
          entries: [],
          isRecording,
          updatedAt: Date.now()
        }
      });
    }

    currentEntries = [];
    renderAll();
    showToast('Đã xóa dữ liệu phụ đề');
  });

  /**
   * Lắng nghe cập nhật thời gian thực từ chrome.storage.local
   */
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !activeRoomId) return;
    const key = `${STORAGE_PREFIX}${activeRoomId}`;
    if (!changes[key]) return;

    const nextValue = changes[key].newValue;
    if (!nextValue) return;

    currentEntries = Array.isArray(nextValue.entries) ? nextValue.entries : [];
    if (isOnMeetTab && typeof nextValue.isRecording === 'boolean') {
      isRecording = nextValue.isRecording;
    }
    renderAll();
  });

  /**
   * Khởi tạo Popup: kiểm tra tab hiện tại, kết nối content script hoặc tải từ storage
   */
  async function initPopup() {
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (result) => {
        resolve(result || []);
      });
    });

    const activeTab = tabs[0];
    const tabUrl = activeTab && activeTab.url ? activeTab.url : '';
    isOnMeetTab = tabUrl.startsWith('https://meet.google.com/');
    activeTabId = activeTab ? activeTab.id : null;

    if (isOnMeetTab) {
      activeRoomId = getRoomIdFromUrl(tabUrl);

      if (activeRoomId && activeTabId !== null) {
        const liveStatus = await sendMessageToTab(activeTabId, { type: 'GET_STATUS' });
        if (liveStatus) {
          needsReloadHint = false;
          activeRoomId = liveStatus.roomId || activeRoomId;
          isRecording = Boolean(liveStatus.isRecording);
          currentEntries = Array.isArray(liveStatus.entries) ? liveStatus.entries : [];
          renderAll();
          return;
        }

        // Content script chưa chạy trên tab đã mở trước khi cài extension -> đọc tạm từ storage
        needsReloadHint = true;
        const saved = await loadRoomFromStorage(activeRoomId);
        currentEntries = saved && Array.isArray(saved.entries) ? saved.entries : [];
        isRecording = false;
        renderAll();
        return;
      }

      renderAll();
      return;
    }

    // Nếu không mở tab Google Meet, hiển thị lại phòng gần nhất đã lưu để tiện copy/xuất file
    const lastRoomData = await new Promise((resolve) => {
      chrome.storage.local.get([LAST_ROOM_KEY], (res) => resolve(res[LAST_ROOM_KEY] || null));
    });

    if (lastRoomData) {
      activeRoomId = lastRoomData;
      const saved = await loadRoomFromStorage(activeRoomId);
      currentEntries = saved && Array.isArray(saved.entries) ? saved.entries : [];
    }

    isRecording = false;
    renderAll();
  }

  initPopup();
})();
