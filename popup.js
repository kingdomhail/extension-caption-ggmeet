/*!
 * Captions Recorder for Google Meet - Popup Script
 * Copyright (c) 2026 Hải Lập Trình. All rights reserved.
 */
(() => {
  'use strict';

  const STORAGE_PREFIX = 'meet_captions_';
  const PEOPLE_PREFIX = 'meet_people_';
  const CHAT_PREFIX = 'meet_chat_';
  const LAST_ROOM_KEY = 'meet_captions_last_room';
  const KEEP_MUTED_KEY = 'meet_keep_muted';
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
  const emptyTitleEl = document.getElementById('emptyTitle');
  const emptyDescEl = document.getElementById('emptyDesc');
  const previewTitleEl = document.getElementById('previewTitle');
  const previewHintEl = document.getElementById('autoScrollHint');
  const captionActionsEl = document.querySelector('.actions');
  const peopleActionsEl = document.getElementById('peopleActions');
  const chatActionsEl = document.getElementById('chatActions');
  const peoplePdfBtn = document.getElementById('peoplePdfBtn');
  const peopleExcelBtn = document.getElementById('peopleExcelBtn');
  const peoplePngBtn = document.getElementById('peoplePngBtn');
  const chatTxtBtn = document.getElementById('chatTxtBtn');
  const tabButtons = {
    captions: document.getElementById('tabCaptions'),
    people: document.getElementById('tabPeople'),
    chat: document.getElementById('tabChat')
  };
  const copyBtn = document.getElementById('copyBtn');
  const copyBtnLabel = document.getElementById('copyBtnLabel');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const clearBtnLabel = document.getElementById('clearBtnLabel');
  const toastEl = document.getElementById('toast');
  const keepMutedToggle = document.getElementById('keepMutedToggle');

  // State
  let activeTabId = null;
  let isOnMeetTab = false;
  let activeRoomId = null;
  let currentEntries = [];
  let currentPeople = [];
  let peoplePartial = true;
  let currentChat = [];
  let activePanel = 'captions';
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
  function fileStamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  function buildFileName() {
    return `meet-captions-${fileStamp()}.txt`;
  }

  function downloadBlob(fileName, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Downloaded ${fileName}`);
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
  function showEmpty(title, description) {
    emptyTitleEl.textContent = title;
    emptyDescEl.textContent = description;
    captionListEl.innerHTML = '';
    captionListEl.appendChild(emptyStateEl);
  }

  function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const letters = parts.slice(0, 2).map((part) => part[0]);
    return letters.join('').toUpperCase();
  }

  function avatarFromPeople(name) {
    const key = String(name || '').trim().toLowerCase();
    if (!key) return '';
    const person = currentPeople.find((item) => String(item.name || '').trim().toLowerCase() === key);
    return person && person.avatarUrl ? person.avatarUrl : '';
  }

  function appendAvatar(parent, name, url) {
    if (url) {
      const img = document.createElement('img');
      img.className = 'avatar';
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      img.src = url;
      img.addEventListener('error', () => {
        const fallback = document.createElement('span');
        fallback.className = 'avatar';
        fallback.textContent = initials(name);
        img.replaceWith(fallback);
      });
      parent.appendChild(img);
      return;
    }
    const badge = document.createElement('span');
    badge.className = 'avatar';
    badge.textContent = initials(name);
    parent.appendChild(badge);
  }

  function renderCaptions(stickToBottom) {
    previewTitleEl.textContent = 'Latest Captions Preview';
    previewHintEl.textContent = 'Real-time';
    if (currentEntries.length === 0) {
      showEmpty(
        'No captions recorded yet',
        'Join a Google Meet call and turn on Captions (CC) to start recording automatically.'
      );
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
      speakerSpan.textContent = item.speaker || 'Speaker';

      appendAvatar(meta, item.speaker, item.avatarUrl || avatarFromPeople(item.speaker));
      meta.appendChild(speakerSpan);
      meta.appendChild(timeSpan);

      const textDiv = document.createElement('div');
      textDiv.className = 'caption-text';
      textDiv.textContent = item.text;

      card.appendChild(meta);
      card.appendChild(textDiv);
      fragment.appendChild(card);
    }

    captionListEl.innerHTML = '';
    captionListEl.appendChild(fragment);

    if (stickToBottom) {
      captionListEl.scrollTop = captionListEl.scrollHeight;
    }
  }

  function renderPeople() {
    previewTitleEl.textContent = 'Participants';
    previewHintEl.textContent = peoplePartial ? 'On screen' : 'Full list';
    if (currentPeople.length === 0) {
      showEmpty(
        'No participants yet',
        'Join the meeting. Names on screen show up here. Open People in Meet to include everyone.'
      );
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const person of currentPeople) {
      const row = document.createElement('div');
      row.className = 'person-row';
      appendAvatar(row, person.name, person.avatarUrl);

      const name = document.createElement('span');
      name.className = 'person-name';
      name.textContent = person.name;

      row.appendChild(name);
      if (person.isSelf) {
        const tag = document.createElement('span');
        tag.className = 'you-tag';
        tag.textContent = 'You';
        row.appendChild(tag);
      }
      fragment.appendChild(row);
    }

    captionListEl.innerHTML = '';
    captionListEl.appendChild(fragment);
  }

  function renderChat(stickToBottom) {
    previewTitleEl.textContent = 'In-call chat';
    previewHintEl.textContent = `${currentChat.length} saved`;
    if (currentChat.length === 0) {
      showEmpty(
        'No chat messages yet',
        'Open Chat in Meet. Messages already seen stay here. Scroll up in the chat panel to capture older ones.'
      );
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const message of currentChat.slice(-MAX_PREVIEW_ITEMS)) {
      const card = document.createElement('div');
      card.className = 'chat-item';

      const meta = document.createElement('div');
      meta.className = 'caption-meta';
      appendAvatar(meta, message.sender, message.avatarUrl || avatarFromPeople(message.sender));

      const sender = document.createElement('span');
      sender.className = 'caption-speaker';
      sender.textContent = message.sender || 'Unknown';

      meta.appendChild(sender);
      if (message.timeLabel) {
        const time = document.createElement('span');
        time.className = 'caption-time';
        time.textContent = message.timeLabel;
        meta.appendChild(time);
      }

      const text = document.createElement('div');
      text.className = 'caption-text';
      text.textContent = message.text;

      card.appendChild(meta);
      card.appendChild(text);
      fragment.appendChild(card);
    }

    captionListEl.innerHTML = '';
    captionListEl.appendChild(fragment);
    if (stickToBottom) {
      captionListEl.scrollTop = captionListEl.scrollHeight;
    }
  }

  function renderTabs() {
    const counts = {
      captions: currentEntries.length,
      people: currentPeople.length,
      chat: currentChat.length
    };
    const labels = { captions: 'Captions', people: 'People', chat: 'Chat' };
    for (const key of Object.keys(tabButtons)) {
      const button = tabButtons[key];
      const count = counts[key];
      button.textContent = count > 0 ? `${labels[key]} ${count}` : labels[key];
      button.setAttribute('aria-selected', activePanel === key ? 'true' : 'false');
    }
    captionActionsEl.hidden = activePanel !== 'captions';
    peopleActionsEl.hidden = activePanel !== 'people';
    chatActionsEl.hidden = activePanel !== 'chat';
    const peopleEmpty = currentPeople.length === 0;
    peoplePdfBtn.disabled = peopleEmpty;
    peopleExcelBtn.disabled = peopleEmpty;
    peoplePngBtn.disabled = peopleEmpty;
    chatTxtBtn.disabled = currentChat.length === 0;
  }

  function renderPanel(stickToBottom) {
    if (activePanel === 'people') renderPeople();
    else if (activePanel === 'chat') renderChat(stickToBottom);
    else renderCaptions(stickToBottom);
  }

  function renderAll() {
    renderStatus();
    const isNearBottom =
      captionListEl.scrollHeight - captionListEl.scrollTop - captionListEl.clientHeight < 48;
    renderTabs();
    renderPanel(isNearBottom || captionListEl.scrollHeight <= captionListEl.clientHeight + 8);
  }

  /**
   * Load stored captions for a room from chrome.storage.local
   */
  function applyRoster(status) {
    currentPeople = status && Array.isArray(status.people) ? status.people : [];
    peoplePartial = !status || status.partial !== false && status.peoplePartial !== false;
    currentChat = status && Array.isArray(status.messages)
      ? status.messages
      : status && Array.isArray(status.chat)
        ? status.chat
        : [];
  }

  function loadSideFromStorage(roomId) {
    return new Promise((resolve) => {
      if (!roomId) {
        resolve(null);
        return;
      }
      const peopleKey = `${PEOPLE_PREFIX}${roomId}`;
      const chatKey = `${CHAT_PREFIX}${roomId}`;
      chrome.storage.local.get([peopleKey, chatKey], (res) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        const peopleRecord = res[peopleKey] || {};
        const chatRecord = res[chatKey] || {};
        resolve({
          people: Array.isArray(peopleRecord.people) ? peopleRecord.people : [],
          partial: peopleRecord.partial !== false,
          messages: Array.isArray(chatRecord.messages) ? chatRecord.messages : []
        });
      });
    });
  }

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
    downloadBlob(buildFileName(), new Blob([formatTranscript(currentEntries)], { type: 'text/plain;charset=utf-8' }));
  });

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatChatExport(messages) {
    return messages
      .map((message) => {
        const time = message.timeLabel ? `[${message.timeLabel}] ` : '';
        return `${time}${message.sender || 'Unknown'}: ${message.text}`;
      })
      .join('\n\n');
  }

  function fitCanvasText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let value = text;
    while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth) {
      value = value.slice(0, -1);
    }
    return `${value}…`;
  }

  function drawPeopleSheet(people, width, height, pageLabel) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 40px Segoe UI, Arial, sans-serif';
    ctx.fillText('Participants', 64, 78);
    ctx.font = '400 22px Segoe UI, Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    const room = activeRoomId ? `Room ${activeRoomId}  ·  ` : '';
    ctx.fillText(`${room}${people.length} people  ·  ${fileStamp()}${pageLabel}`, 64, 116);

    people.forEach((person, index) => {
      const y = 156 + index * 68;
      ctx.fillStyle = index % 2 === 0 ? '#f8fafc' : '#ffffff';
      ctx.fillRect(48, y, width - 96, 60);
      ctx.fillStyle = '#1a73e8';
      ctx.font = '700 22px Segoe UI, Arial, sans-serif';
      ctx.fillText(String(person.number), 72, y + 38);
      ctx.fillStyle = '#0f172a';
      ctx.font = '600 26px Segoe UI, Arial, sans-serif';
      const name = person.isSelf ? `${person.name} (You)` : person.name;
      ctx.fillText(fitCanvasText(ctx, name, width - 220), 140, y + 39);
    });
    return canvas;
  }

  function peopleRows() {
    return currentPeople.map((person, index) => ({ ...person, number: index + 1 }));
  }

  const PEOPLE_ROW_HEIGHT = 68;
  const PEOPLE_PAGE_WIDTH = 1240;
  const PEOPLE_PAGE_HEIGHT = 1754;
  const PEOPLE_HEADER_HEIGHT = 156;

  function rowsPerPeoplePage() {
    return Math.floor((PEOPLE_PAGE_HEIGHT - PEOPLE_HEADER_HEIGHT - 48) / PEOPLE_ROW_HEIGHT);
  }

  function peopleCanvases() {
    const rows = peopleRows();
    const perPage = rowsPerPeoplePage();
    const pages = [];
    for (let start = 0; start < rows.length; start += perPage) {
      const slice = rows.slice(start, start + perPage);
      const pageNumber = pages.length + 1;
      const pageCount = Math.ceil(rows.length / perPage);
      pages.push(drawPeopleSheet(slice, PEOPLE_PAGE_WIDTH, PEOPLE_PAGE_HEIGHT, `  ·  ${pageNumber}/${pageCount}`));
    }
    return pages;
  }

  function peoplePngCanvas() {
    const rows = peopleRows();
    const height = PEOPLE_HEADER_HEIGHT + rows.length * PEOPLE_ROW_HEIGHT + 48;
    return drawPeopleSheet(rows, 1000, height, '');
  }

  function canvasToJpeg(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Could not draw the participant list'));
          return;
        }
        resolve(new Uint8Array(await blob.arrayBuffer()));
      }, 'image/jpeg', 0.92);
    });
  }

  function concatBytes(parts) {
    const size = parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) {
      out.set(part, offset);
      offset += part.length;
    }
    return out;
  }

  function buildJpegPdf(images) {
    const encoder = new TextEncoder();
    const chunks = [];
    const offsets = [0];
    let length = 0;
    const push = (data) => {
      const bytes = typeof data === 'string' ? encoder.encode(data) : data;
      chunks.push(bytes);
      length += bytes.length;
    };
    const startObj = () => offsets.push(length);
    const pageW = 595;
    const pageH = 842;
    const count = images.length;
    const kids = images.map((_, index) => `${3 + index * 3} 0 R`);

    push('%PDF-1.3\n');
    startObj();
    push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    startObj();
    push(`2 0 obj\n<< /Type /Pages /Count ${count} /Kids [${kids.join(' ')}] >>\nendobj\n`);

    images.forEach((image, index) => {
      const pageId = 3 + index * 3;
      const contentId = pageId + 1;
      const imageId = pageId + 2;
      const content = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`;
      startObj();
      push(`${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents ${contentId} 0 R /Resources << /XObject << /Im0 ${imageId} 0 R >> >> >>\nendobj\n`);
      startObj();
      push(`${contentId} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
      startObj();
      push(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`);
      push(image.bytes);
      push('\nendstream\nendobj\n');
    });

    const xrefAt = length;
    const objectCount = 2 + count * 3;
    let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
    for (let id = 1; id <= objectCount; id += 1) {
      xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    }
    push(xref);
    push(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`);
    return concatBytes(chunks);
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) {
      crc ^= bytes[i];
      for (let bit = 0; bit < 8; bit += 1) {
        const mask = (crc & 1) === 1 ? 0xedb88320 : 0;
        crc = (crc >>> 1) ^ mask;
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function u16(value) {
    return new Uint8Array([value & 255, (value >> 8) & 255]);
  }

  function u32(value) {
    return new Uint8Array([value & 255, (value >> 8) & 255, (value >> 16) & 255, (value >> 24) & 255]);
  }

  function buildZip(files) {
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const dosDate = ((Math.max(now.getFullYear(), 1980) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const encoder = new TextEncoder();
    const locals = [];
    const centrals = [];
    let offset = 0;

    for (const file of files) {
      const name = encoder.encode(file.name);
      const data = encoder.encode(file.data);
      const crc = crc32(data);
      const local = concatBytes([
        u32(0x04034b50), u16(20), u16(0), u16(0),
        u16(dosTime), u16(dosDate),
        u32(crc), u32(data.length), u32(data.length),
        u16(name.length), u16(0),
        name, data
      ]);
      const central = concatBytes([
        u32(0x02014b50), u16(20), u16(20), u16(0), u16(0),
        u16(dosTime), u16(dosDate),
        u32(crc), u32(data.length), u32(data.length),
        u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0),
        u32(offset),
        name
      ]);
      locals.push(local);
      centrals.push(central);
      offset += local.length;
    }

    const centralBytes = concatBytes(centrals);
    const end = concatBytes([
      u32(0x06054b50), u16(0), u16(0),
      u16(files.length), u16(files.length),
      u32(centralBytes.length), u32(offset), u16(0)
    ]);
    return concatBytes([...locals, centralBytes, end]);
  }

  function sheetCell(column, row, value) {
    return `<c r="${column}${row}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
  }

  function buildPeopleWorkbook(people) {
    const rows = [
      `<row r="1">${sheetCell('A', 1, '#')}${sheetCell('B', 1, 'Name')}${sheetCell('C', 1, 'You')}</row>`,
      ...people.map((person, index) => {
        const row = index + 2;
        return `<row r="${row}">${sheetCell('A', row, String(index + 1))}${sheetCell('B', row, person.name)}${sheetCell('C', row, person.isSelf ? 'Yes' : '')}</row>`;
      })
    ];
    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>
${rows.join('\n')}
</sheetData></worksheet>`;
    return buildZip([
      {
        name: '[Content_Types].xml',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`
      },
      {
        name: '_rels/.rels',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
      },
      {
        name: 'xl/workbook.xml',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="People" sheetId="1" r:id="rId1"/></sheets></workbook>`
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`
      },
      { name: 'xl/worksheets/sheet1.xml', data: sheet }
    ]);
  }

  peoplePdfBtn.addEventListener('click', async () => {
    if (currentPeople.length === 0) return;
    peoplePdfBtn.disabled = true;
    try {
      const pages = peopleCanvases();
      const images = [];
      for (const page of pages) {
        images.push({
          bytes: await canvasToJpeg(page),
          width: page.width,
          height: page.height
        });
      }
      const fileName = `meet-people-${fileStamp()}.pdf`;
      downloadBlob(fileName, new Blob([buildJpegPdf(images)], { type: 'application/pdf' }));
    } catch {
      showToast('Could not create the PDF');
    } finally {
      peoplePdfBtn.disabled = currentPeople.length === 0;
    }
  });

  peopleExcelBtn.addEventListener('click', () => {
    if (currentPeople.length === 0) return;
    const fileName = `meet-people-${fileStamp()}.xlsx`;
    downloadBlob(fileName, new Blob([buildPeopleWorkbook(currentPeople)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  });

  peoplePngBtn.addEventListener('click', () => {
    if (currentPeople.length === 0) return;
    const canvas = peoplePngCanvas();
    canvas.toBlob((blob) => {
      if (!blob) {
        showToast('Could not create the PNG');
        return;
      }
      downloadBlob(`meet-people-${fileStamp()}.png`, blob);
    }, 'image/png');
  });

  chatTxtBtn.addEventListener('click', () => {
    if (currentChat.length === 0) return;
    const fileName = `meet-chat-${fileStamp()}.txt`;
    downloadBlob(fileName, new Blob([formatChatExport(currentChat)], { type: 'text/plain;charset=utf-8' }));
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
    const peopleKey = `${PEOPLE_PREFIX}${activeRoomId}`;
    const chatKey = `${CHAT_PREFIX}${activeRoomId}`;
    let changed = false;

    if (changes[key] && changes[key].newValue) {
      const nextValue = changes[key].newValue;
      currentEntries = Array.isArray(nextValue.entries) ? nextValue.entries : [];
      if (isOnMeetTab && typeof nextValue.isRecording === 'boolean') {
        isRecording = nextValue.isRecording;
      }
      changed = true;
    }

    if (changes[peopleKey] && changes[peopleKey].newValue) {
      const nextValue = changes[peopleKey].newValue;
      currentPeople = Array.isArray(nextValue.people) ? nextValue.people : [];
      peoplePartial = nextValue.partial !== false;
      changed = true;
    }

    if (changes[chatKey] && changes[chatKey].newValue) {
      const nextValue = changes[chatKey].newValue;
      currentChat = Array.isArray(nextValue.messages) ? nextValue.messages : [];
      changed = true;
    }

    if (changed) renderAll();
  });

  for (const key of Object.keys(tabButtons)) {
    tabButtons[key].addEventListener('click', () => {
      activePanel = key;
      renderTabs();
      renderPanel(true);
    });
  }

  /**
   * Initialize popup state from active tab or local storage
   */
  function applyKeepMuted(enabled) {
    chrome.storage.local.set({ [KEEP_MUTED_KEY]: enabled });
    if (isOnMeetTab && activeTabId !== null) {
      sendMessageToTab(activeTabId, { type: 'SET_KEEP_MUTED', enabled });
    }
  }

  keepMutedToggle.addEventListener('change', () => {
    applyKeepMuted(keepMutedToggle.checked);
  });

  async function initPopup() {
    const storedMute = await new Promise((resolve) => {
      chrome.storage.local.get([KEEP_MUTED_KEY], (result) => {
        resolve(Boolean(result[KEEP_MUTED_KEY]));
      });
    });
    keepMutedToggle.checked = storedMute;
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
          applyRoster(liveStatus);
          renderAll();
          return;
        }

        // Content script not yet injected on a pre-existing tab; fall back to stored captions
        needsReloadHint = true;
        const saved = await loadRoomFromStorage(activeRoomId);
        currentEntries = saved && Array.isArray(saved.entries) ? saved.entries : [];
        applyRoster(await loadSideFromStorage(activeRoomId));
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
      applyRoster(await loadSideFromStorage(activeRoomId));
    }

    isRecording = false;
    renderAll();
  }

  initPopup();
})();
