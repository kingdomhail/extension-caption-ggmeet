/*!
 * Captions Recorder for Google Meet - Popup Script
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
   * Extract Google Meet room code from URL
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
   * Format transcript entries as:
   * [HH:MM:SS] Speaker: Text
   */
  function formatTranscript(entries) {
    return entries
      .map((item) => `[${item.timestamp}] ${item.speaker}: ${item.text}`)
      .join('\n');
  }

  /**
   * Build export filename: meet-captions-YYYY-MM-DD.txt
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
   * Show temporary toast notification
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
   * Render recording status, line count, room badge, and button states
   */
  function renderStatus() {
    const count = currentEntries.length;
    lineCountEl.textContent = `${count} ${count === 1 ? 'line' : 'lines'}`;

    const hasEntries = count > 0;
    copyBtn.disabled = !hasEntries;
    downloadBtn.disabled = !hasEntries;
    clearBtn.disabled = !hasEntries;

    if (isOnMeetTab && activeRoomId) {
      roomBadgeEl.textContent = `Room: ${activeRoomId}`;
      if (needsReloadHint) {
        statusDotEl.className = 'status-dot idle';
        statusTextEl.textContent = 'Page not connected';
        statusHintEl.textContent = 'Reload (F5) Meet tab';
      } else if (isRecording) {
        statusDotEl.className = 'status-dot recording';
        statusTextEl.textContent = 'Recording';
        statusHintEl.textContent = 'Captions ON';
      } else {
        statusDotEl.className = 'status-dot idle';
        statusTextEl.textContent = 'Captions Off';
        statusHintEl.textContent = 'Click CC in Meet';
      }
    } else if (isOnMeetTab && !activeRoomId) {
      roomBadgeEl.textContent = 'Google Meet Home';
      statusDotEl.className = 'status-dot offline';
      statusTextEl.textContent = 'Not in a meeting';
      statusHintEl.textContent = 'Join a meeting to record';
    } else if (activeRoomId) {
      roomBadgeEl.textContent = `Last room: ${activeRoomId}`;
      statusDotEl.className = 'status-dot offline';
      statusTextEl.textContent = 'Captions Off';
      statusHintEl.textContent = 'Not on Meet tab';
    } else {
      roomBadgeEl.textContent = 'Google Meet not open';
      statusDotEl.className = 'status-dot offline';
      statusTextEl.textContent = 'Captions Off';
      statusHintEl.textContent = 'Open meet.google.com';
    }
  }

  /**
   * Render latest captions preview (auto-scrolls when near bottom)
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
   * Load stored captions for a room from chrome.storage.local
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
   * Send a message to the content script in the active Meet tab
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
   * Copy text to clipboard with fallback
   */
  async function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fallback below
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
   * Reset clear confirmation button state
   */
  function resetClearConfirm() {
    if (clearConfirmTimer) {
      clearTimeout(clearConfirmTimer);
      clearConfirmTimer = null;
    }
    clearBtn.classList.remove('confirming');
    clearBtnLabel.textContent = 'Clear Data';
  }

  /**
   * Copy All button click handler
   */
  copyBtn.addEventListener('click', async () => {
    if (currentEntries.length === 0) return;
    const text = formatTranscript(currentEntries);
    const copied = await copyTextToClipboard(text);
    if (copied) {
      copyBtn.classList.add('copied');
      copyBtnLabel.textContent = 'Copied!';
      showToast('Copied all captions');
      if (copyFeedbackTimer) clearTimeout(copyFeedbackTimer);
      copyFeedbackTimer = setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtnLabel.textContent = 'Copy All';
      }, 1800);
    } else {
      showToast('Failed to copy to clipboard');
    }
  });

  /**
   * Download .txt button click handler
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

    showToast(`Downloaded ${fileName}`);
  });

  /**
   * Clear Data button click handler (two-step inline confirmation)
   */
  clearBtn.addEventListener('click', async () => {
    if (currentEntries.length === 0) return;

    if (!clearBtn.classList.contains('confirming')) {
      clearBtn.classList.add('confirming');
      clearBtnLabel.textContent = 'Confirm clear?';
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
    showToast('Cleared caption data');
  });

  /**
   * Listen for real-time updates from chrome.storage.local
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
   * Initialize popup state from active tab or local storage
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

        // Content script not yet injected on a pre-existing tab; fall back to stored captions
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

    // When not on a Meet tab, show the most recently recorded room for easy export
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
