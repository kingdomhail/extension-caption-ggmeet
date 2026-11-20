/*!
 * Captions Recorder for Google Meet - Content Script
 * Copyright (c) 2026 Hải Lập Trình. All rights reserved.
 */
(() => {
  'use strict';

  const STORAGE_PREFIX = 'meet_captions_';
  const LAST_ROOM_KEY = 'meet_captions_last_room';
  const SAVE_DEBOUNCE_MS = 300;
  const SCAN_THROTTLE_MS = 120;
  const HEALTH_CHECK_MS = 1500;
  const NEW_BLOCK_MERGE_WINDOW_MS = 8000;

  // Selector ưu tiên và dự phòng cho cấu trúc DOM của Google Meet
  const BLOCK_SELECTORS = [
    '.nMcdL',
    '.TBMuR',
    '.iOzk7',
    '[jsname="YSxPC"]'
  ];

  const SPEAKER_SELECTORS = [
    '.NWpY1d',
    '.zs7s8d',
    '.jxFHg'
  ];

  const TEXT_SELECTORS = [
    '.ygicle',
    '.VbkSUe',
    '[jsname="tgaKEf"]',
    '.iTTPOb',
    '.bh44bd'
  ];

  const IGNORED_PATH_SEGMENTS = new Set([
    'landing',
    'new',
    'lookup',
    'about',
    'calling',
    'whoops',
    '_meet'
  ]);

  const IGNORED_UI_TEXTS = new Set([
    'jump to bottom',
    'chuyển xuống dưới cùng',
    'cuộn xuống dưới cùng',
    'caption settings',
    'cài đặt phụ đề',
    'font size',
    'cỡ chữ',
    'font color',
    'màu chữ',
    'captions',
    'phụ đề',
    'beta'
  ]);

  // Trạng thái hiện tại của content script
  let currentRoomId = null;
  let entries = [];
  let entryCounter = 0;
  let isRecording = false;
  let captionContainer = null;
  let containerObserver = null;
  let bodyObserver = null;
  let scanTimer = null;
  let saveTimer = null;
  let lastCheckedUrl = '';

  // Ánh xạ DOM block -> thông tin entry đã ghi để cập nhật đúng dòng đang nói
  let blockTrackMap = new WeakMap();

  /**
   * Trích xuất mã phòng họp từ URL Google Meet
   */
  function getRoomIdFromUrl(urlString) {
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
   * Format thời gian địa phương dạng HH:MM:SS
   */
  function formatLocalTime(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  /**
   * Chuẩn hóa chuỗi để so sánh chống trùng lặp (bỏ dấu câu, gộp khoảng trắng)
   */
  function normalizeText(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Làm sạch chuỗi hiển thị (gộp khoảng trắng thừa)
   */
  function cleanDisplayText(str) {
    if (!str) return '';
    return str.replace(/\s+/g, ' ').trim();
  }

  /**
   * Kiểm tra phần tử có đang hiển thị trên màn hình hay không
   */
  function isElementVisible(el) {
    if (!el || !el.isConnected) return false;
    const style = window.getComputedStyle(el);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      parseFloat(style.opacity) === 0
    ) {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  /**
   * Kiểm tra nút bật/tắt phụ đề (CC) trên thanh công cụ Meet có đang bật không
   */
  function isCaptionToggleButtonOn() {
    const buttons = document.querySelectorAll('button[aria-label], [role="button"][aria-label]');
    for (const btn of buttons) {
      const label = (btn.getAttribute('aria-label') || '').trim();
      if (!label) continue;
      const isCaptionLabel = /phụ đề|captions/i.test(label);
      if (!isCaptionLabel) continue;

      if (btn.getAttribute('aria-pressed') === 'true') {
        return true;
      }
      if (/^(tắt phụ đề|turn off captions)/i.test(label)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Kiểm tra phần tử có phải là nút/dialog/menu điều khiển (không phải vùng phụ đề)
   */
  function isExcludedControlElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return true;
    const tag = el.tagName.toLowerCase();
    if (tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea') {
      return true;
    }
    const role = (el.getAttribute('role') || '').toLowerCase();
    if (['button', 'dialog', 'alertdialog', 'menu', 'menuitem', 'listbox', 'tooltip', 'tab'].includes(role)) {
      return true;
    }
    const label = (el.getAttribute('aria-label') || '').trim();
    if (/^(bật|tắt|turn on|turn off|cài đặt|settings)/i.test(label)) {
      return true;
    }
    return false;
  }

  /**
   * Tìm vùng chứa phụ đề (hỗ trợ Tiếng Việt, Tiếng Anh và fallback selector dự phòng)
   */
  function findCaptionContainer() {
    // 1. Ưu tiên selector theo chuẩn aria-label Tiếng Việt & Tiếng Anh trên role="region"
    const regionCandidates = document.querySelectorAll(
      '[role="region"][aria-label*="Phụ đề" i], [role="region"][aria-label*="Captions" i]'
    );
    for (const el of regionCandidates) {
      if (!isExcludedControlElement(el)) {
        return el;
      }
    }

    // 2. Fallback: các thẻ div có aria-label chứa Phụ đề / Captions (loại trừ nút bấm & hộp thoại)
    const labelCandidates = document.querySelectorAll(
      'div[aria-label*="Phụ đề" i], div[aria-label*="Captions" i]'
    );
    for (const el of labelCandidates) {
      if (!isExcludedControlElement(el)) {
        return el;
      }
    }

    // 3. Fallback: class/jsname phổ biến của Google Meet nếu đổi aria-label
    const knownContainer =
      document.querySelector('.a4cQT') ||
      document.querySelector('div[jsname="dsyhDe"]');
    if (knownContainer && !isExcludedControlElement(knownContainer)) {
      return knownContainer;
    }

    // 4. Fallback: suy ngược từ các block phụ đề hoặc jsname="tgaKEf"
    for (const selector of [...BLOCK_SELECTORS, 'div[jsname="tgaKEf"]']) {
      const sample = document.querySelector(selector);
      if (sample) {
        const regionParent = sample.closest('[role="region"]') || sample.parentElement;
        if (regionParent && !isExcludedControlElement(regionParent)) {
          return regionParent;
        }
      }
    }

    // 5. Fallback heuristic: vùng aria-live ở nửa dưới màn hình chứa nội dung phụ đề
    const liveRegions = document.querySelectorAll('[aria-live="polite"], [aria-live="assertive"]');
    for (const el of liveRegions) {
      if (isExcludedControlElement(el)) continue;
      const role = (el.getAttribute('role') || '').toLowerCase();
      if (role === 'alert' || role === 'status') continue;
      if (!isElementVisible(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.bottom > window.innerHeight * 0.45 && rect.width >= 180 && rect.height >= 24) {
        const hasAvatarOrBlocks = el.querySelector('img') || el.children.length >= 1;
        if (hasAvatarOrBlocks && cleanDisplayText(el.textContent).length > 0) {
          return el;
        }
      }
    }

    return null;
  }

  /**
   * Trích xuất văn bản sạch từ phần tử, bỏ qua nút bấm, SVG và icon font của Google
   */
  function extractCleanText(rootEl, skipElement = null) {
    if (!rootEl) return '';
    const parts = [];

    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        let parent = node.parentElement;
        while (parent && parent !== rootEl.parentElement) {
          if (parent === skipElement) {
            return NodeFilter.FILTER_REJECT;
          }
          const tag = parent.tagName.toLowerCase();
          if (
            tag === 'button' ||
            tag === 'svg' ||
            tag === 'style' ||
            tag === 'script' ||
            tag === 'i'
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          const role = (parent.getAttribute('role') || '').toLowerCase();
          if (role === 'button' || role === 'tooltip' || role === 'menu') {
            return NodeFilter.FILTER_REJECT;
          }
          const cls = typeof parent.className === 'string' ? parent.className : '';
          if (/(google-material-icons|material-icons|google-symbols)/i.test(cls)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (parent === rootEl) break;
          parent = parent.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let currentNode;
    while ((currentNode = walker.nextNode())) {
      parts.push(currentNode.nodeValue);
    }

    return cleanDisplayText(parts.join(' ')).replace(/\s+([,.;:!?])/g, '$1');
  }

  /**
   * Tìm danh sách các khối (block) đại diện cho từng lượt nói trong vùng phụ đề
   */
  function findCaptionBlocks(container) {
    if (!container) return [];

    // 1. Dùng các selector block đã biết của Google Meet
    for (const selector of BLOCK_SELECTORS) {
      const matched = Array.from(container.querySelectorAll(selector)).filter(
        (el) => !isExcludedControlElement(el)
      );
      if (matched.length > 0) {
        // Loại bỏ block lồng nhau (chỉ giữ lớp ngoài cùng trong danh sách match)
        return matched.filter((el) => !matched.some((other) => other !== el && other.contains(el)));
      }
    }

    // 2. Fallback cấu trúc: tìm các phần tử con chứa avatar (img) + text
    const avatarImgs = Array.from(container.querySelectorAll('img'));
    if (avatarImgs.length > 0) {
      const blockSet = new Set();
      for (const img of avatarImgs) {
        let candidate = img.parentElement;
        while (candidate && candidate.parentElement && candidate.parentElement !== container) {
          const textLen = extractCleanText(candidate).length;
          // Dừng ở khối chứa cả tên người nói và nội dung câu nói
          if (candidate.children.length >= 2 && textLen > 0) {
            const parentImgCount = candidate.parentElement.querySelectorAll('img').length;
            if (parentImgCount > 1 || candidate.parentElement === container) {
              break;
            }
          }
          candidate = candidate.parentElement;
        }
        if (candidate && candidate !== container && !isExcludedControlElement(candidate)) {
          blockSet.add(candidate);
        }
      }
      if (blockSet.size > 0) {
        return Array.from(blockSet);
      }
    }

    // 3. Fallback cuối cùng: duyệt các div con trực tiếp có nội dung text
    const directChildren = Array.from(container.children).filter(
      (el) => !isExcludedControlElement(el) && extractCleanText(el).length > 0
    );
    if (directChildren.length === 1 && directChildren[0].children.length > 1) {
      const grandChildren = Array.from(directChildren[0].children).filter(
        (el) => !isExcludedControlElement(el) && extractCleanText(el).length > 0
      );
      if (grandChildren.length > 0) return grandChildren;
    }
    return directChildren;
  }

  /**
   * Tách Tên người nói và Nội dung câu nói từ một block phụ đề
   */
  function parseCaptionBlock(blockEl, fallbackSpeaker) {
    let speakerEl = null;
    let speaker = '';

    // 1. Tìm tên người nói bằng selector ưu tiên
    for (const selector of SPEAKER_SELECTORS) {
      const found = blockEl.querySelector(selector);
      if (found) {
        const name = extractCleanText(found);
        if (name) {
          speakerEl = found;
          speaker = name;
          break;
        }
      }
    }

    // 2. Tìm nội dung câu nói bằng selector ưu tiên
    let text = '';
    for (const selector of TEXT_SELECTORS) {
      const matches = Array.from(blockEl.querySelectorAll(selector)).filter(
        (el) => el !== speakerEl && (!speakerEl || !speakerEl.contains(el))
      );
      if (matches.length > 0) {
        const topLevel = matches.filter(
          (el) => !matches.some((other) => other !== el && other.contains(el))
        );
        text = cleanDisplayText(topLevel.map((el) => extractCleanText(el)).join(' '));
        if (text) break;
      }
    }

    // 3. Fallback nếu Google Meet đổi class tên người nói hoặc nội dung
    if (!speaker || !text) {
      const meaningfulChildren = Array.from(blockEl.children).filter(
        (child) => !isExcludedControlElement(child) && extractCleanText(child).length > 0
      );

      if (!speaker && meaningfulChildren.length >= 2) {
        const firstText = extractCleanText(meaningfulChildren[0]);
        if (firstText && firstText.length <= 80) {
          speakerEl = meaningfulChildren[0];
          speaker = firstText;
        }
      }

      if (!text) {
        if (speakerEl) {
          // Lấy phần text còn lại sau khi loại trừ phần tử chứa tên người nói
          text = extractCleanText(blockEl, speakerEl);
        } else if (meaningfulChildren.length >= 2) {
          text = cleanDisplayText(
            meaningfulChildren
              .slice(1)
              .map((el) => extractCleanText(el))
              .join(' ')
          );
        } else {
          text = extractCleanText(blockEl);
        }
      }
    }

    // Loại bỏ trường hợp nội dung bị lặp lại tên người nói ở đầu
    if (speaker && text && text.toLowerCase().startsWith(speaker.toLowerCase())) {
      const remainder = text.slice(speaker.length).replace(/^[\s:–-]+/, '').trim();
      if (remainder) {
        text = remainder;
      }
    }

    // Bỏ qua các chuỗi UI thừa của Google Meet (nút nhảy xuống, cài đặt...)
    if (!text || IGNORED_UI_TEXTS.has(text.toLowerCase())) {
      return null;
    }

    // Fallback speaker label if speaker element is unavailable
    if (!speaker) {
      speaker = fallbackSpeaker || 'Speaker';
    }

    return { speaker, text };
  }

  /**
   * Kiểm tra xem newText có phải là bản cập nhật tiếp nối/chỉnh sửa của oldText không
   */
  function isSameUtteranceUpdate(oldText, newText, elapsedMs, isSameDomBlock) {
    const normOld = normalizeText(oldText);
    const normNew = normalizeText(newText);

    if (!normOld || !normNew) return false;
    if (normOld === normNew) return true;

    // Nếu là DOM block mới hoàn toàn mà đã cách nhau khá lâu -> xem như câu mới
    if (!isSameDomBlock && elapsedMs > NEW_BLOCK_MERGE_WINDOW_MS) {
      return false;
    }

    // Trường hợp phổ biến nhất: câu mới nối tiếp câu cũ (hoặc ASR lùi nhẹ vài ký tự)
    if (normNew.startsWith(normOld) || normOld.startsWith(normNew)) {
      return true;
    }

    const oldWords = normOld.split(' ');
    const newWords = normNew.split(' ');
    const minLen = Math.min(oldWords.length, newWords.length);

    // Kiểm tra số từ giống nhau liên tiếp từ đầu câu
    let commonPrefixWords = 0;
    while (commonPrefixWords < minLen && oldWords[commonPrefixWords] === newWords[commonPrefixWords]) {
      commonPrefixWords++;
    }

    if (commonPrefixWords >= 3 || (minLen > 0 && commonPrefixWords / minLen >= 0.6)) {
      return true;
    }

    // Trường hợp ASR sửa một vài từ giữa câu nhưng vẫn là cùng câu đang nói
    if (isSameDomBlock || elapsedMs < 5000) {
      const newWordSet = new Set(newWords);
      let matched = 0;
      for (const word of oldWords) {
        if (newWordSet.has(word)) matched++;
      }
      const overlapRatio = matched / oldWords.length;
      if (overlapRatio >= 0.65 && (commonPrefixWords >= 1 || oldWords.length <= 4)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Phát hiện trường hợp Google Meet cắt bớt phần đầu của một block nói quá dài (sliding window)
   * Trả về phần văn bản bị cắt đi để giữ lại không mất dữ liệu
   */
  function detectEvictedPrefix(prevRaw, nextRaw) {
    if (!prevRaw || !nextRaw || prevRaw.length < 40) return null;

    const prevWords = prevRaw.split(/\s+/);
    const nextWords = nextRaw.split(/\s+/);
    if (prevWords.length < 8 || nextWords.length < 4) return null;

    const normPrevStart = normalizeText(prevWords.slice(0, 2).join(' '));
    const normNextStart = normalizeText(nextWords.slice(0, 2).join(' '));
    if (normPrevStart === normNextStart) return null;

    // Tìm đoạn đầu của nextWords (ít nhất 4 từ) xuất hiện ở vị trí phía sau trong prevWords
    const anchorLen = Math.min(5, nextWords.length);
    const anchor = normalizeText(nextWords.slice(0, anchorLen).join(' '));
    if (anchor.length < 12) return null;

    for (let i = 3; i <= prevWords.length - anchorLen; i++) {
      const slice = normalizeText(prevWords.slice(i, i + anchorLen).join(' '));
      if (slice === anchor) {
        const evictedPrefix = prevWords.slice(0, i).join(' ').trim();
        if (evictedPrefix.length >= 18) {
          return evictedPrefix;
        }
      }
    }
    return null;
  }

  /**
   * Tạo entry mới
   */
  function createEntry(speaker, text) {
    const now = Date.now();
    entryCounter += 1;
    return {
      id: `cap_${now}_${entryCounter}`,
      timestamp: formatLocalTime(new Date(now)),
      speaker,
      text,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Xử lý một block phụ đề và áp dụng logic chống trùng lặp / cập nhật câu đang nói
   */
  function upsertCaptionBlock(blockEl, speaker, text) {
    const now = Date.now();
    const tracked = blockTrackMap.get(blockEl);

    if (tracked) {
      const existing = entries.find((item) => item.id === tracked.entryId);
      if (existing && existing.speaker === speaker) {
        if (tracked.lastRawText === text) {
          return false;
        }

        // Xử lý nếu Google Meet cắt bớt câu cũ ở đầu block quá dài
        const evictedPrefix = detectEvictedPrefix(tracked.lastRawText, text);
        if (evictedPrefix) {
          existing.text = evictedPrefix;
          existing.updatedAt = now;

          const nextEntry = createEntry(speaker, text);
          entries.push(nextEntry);
          blockTrackMap.set(blockEl, {
            entryId: nextEntry.id,
            lastRawText: text,
            speaker
          });
          return true;
        }

        // Nếu vẫn là câu đang nói dở -> cập nhật dòng hiện tại
        if (isSameUtteranceUpdate(existing.text, text, now - existing.updatedAt, true)) {
          existing.text = text;
          existing.updatedAt = now;
          tracked.lastRawText = text;
          return true;
        }

        // Block DOM bị tái sử dụng cho câu hoàn toàn mới -> tạo dòng mới
        const newEntry = createEntry(speaker, text);
        entries.push(newEntry);
        blockTrackMap.set(blockEl, {
          entryId: newEntry.id,
          lastRawText: text,
          speaker
        });
        return true;
      }
    }

    // Trường hợp block DOM mới xuất hiện: kiểm tra 5 dòng gần nhất xem có phải Meet vừa re-render không
    const recentStart = Math.max(0, entries.length - 5);
    for (let i = entries.length - 1; i >= recentStart; i--) {
      const candidate = entries[i];
      if (candidate.speaker !== speaker) continue;

      const normCand = normalizeText(candidate.text);
      const normNew = normalizeText(text);

      // Trùng khớp hoàn toàn -> chỉ ánh xạ lại DOM block, không tạo dòng trùng
      if (normCand === normNew) {
        blockTrackMap.set(blockEl, {
          entryId: candidate.id,
          lastRawText: text,
          speaker
        });
        return false;
      }

      // Chỉ gộp cập nhật vào dòng gần nhất của người đó (trong 2 dòng cuối)
      if (i >= entries.length - 2 && isSameUtteranceUpdate(candidate.text, text, now - candidate.updatedAt, false)) {
        // Tránh ghi đè bản dài đầy đủ bằng đoạn ngắn hơn bị cắt cũ
        if (!(normCand.startsWith(normNew) && normNew.length < normCand.length)) {
          candidate.text = text;
          candidate.updatedAt = now;
        }
        blockTrackMap.set(blockEl, {
          entryId: candidate.id,
          lastRawText: text,
          speaker
        });
        return true;
      }
    }

    // Đổi người nói hoặc sang câu mới -> tạo dòng mới với mốc thời gian thực
    const newEntry = createEntry(speaker, text);
    entries.push(newEntry);
    blockTrackMap.set(blockEl, {
      entryId: newEntry.id,
      lastRawText: text,
      speaker
    });
    return true;
  }

  /**
   * Lưu dữ liệu vào chrome.storage.local theo mã phòng họp (có debounce)
   */
  function scheduleSave(immediate = false) {
    if (!currentRoomId) return;

    const persist = () => {
      saveTimer = null;
      const roomKey = `${STORAGE_PREFIX}${currentRoomId}`;
      const payload = {
        roomId: currentRoomId,
        entries,
        isRecording,
        updatedAt: Date.now()
      };
      try {
        chrome.storage.local.set({
          [roomKey]: payload,
          [LAST_ROOM_KEY]: currentRoomId
        });
      } catch {
        // Extension context có thể đã bị reload; bỏ qua an toàn
      }
    };

    if (immediate) {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      persist();
      return;
    }

    if (saveTimer) return;
    saveTimer = setTimeout(persist, SAVE_DEBOUNCE_MS);
  }

  /**
   * Tải dữ liệu cũ của phòng họp (nếu có) từ chrome.storage.local
   */
  function loadRoomEntries(roomId) {
    return new Promise((resolve) => {
      if (!roomId) {
        resolve([]);
        return;
      }
      const roomKey = `${STORAGE_PREFIX}${roomId}`;
      try {
        chrome.storage.local.get([roomKey], (result) => {
          if (chrome.runtime.lastError) {
            resolve([]);
            return;
          }
          const saved = result[roomKey];
          if (saved && Array.isArray(saved.entries)) {
            resolve(saved.entries);
          } else {
            resolve([]);
          }
        });
      } catch {
        resolve([]);
      }
    });
  }

  /**
   * Quét toàn bộ block phụ đề hiện có trong container
   */
  function scanCaptions() {
    if (!currentRoomId) return;

    const container = captionContainer && captionContainer.isConnected
      ? captionContainer
      : findCaptionContainer();

    if (container !== captionContainer) {
      attachContainerObserver(container);
    }

    const containerVisible = Boolean(container && isElementVisible(container));
    const nextRecordingState = containerVisible || isCaptionToggleButtonOn();

    let changed = false;
    if (nextRecordingState !== isRecording) {
      isRecording = nextRecordingState;
      changed = true;
    }

    if (container && containerVisible) {
      const blocks = findCaptionBlocks(container);
      let lastSpeakerInScan = entries.length > 0 ? entries[entries.length - 1].speaker : 'Speaker';

      for (const blockEl of blocks) {
        const parsed = parseCaptionBlock(blockEl, lastSpeakerInScan);
        if (!parsed) continue;
        lastSpeakerInScan = parsed.speaker;
        if (upsertCaptionBlock(blockEl, parsed.speaker, parsed.text)) {
          changed = true;
        }
      }
    }

    if (changed) {
      scheduleSave(false);
    }
  }

  /**
   * Throttle gọi scanCaptions để tránh lag khi Meet cập nhật từng ký tự
   */
  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(() => {
      scanTimer = null;
      scanCaptions();
    }, SCAN_THROTTLE_MS);
  }

  /**
   * Gắn MutationObserver trực tiếp lên vùng chứa phụ đề
   */
  function attachContainerObserver(container) {
    if (containerObserver) {
      containerObserver.disconnect();
      containerObserver = null;
    }
    captionContainer = container;

    if (!captionContainer) return;

    containerObserver = new MutationObserver(() => {
      scheduleScan();
    });

    containerObserver.observe(captionContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  /**
   * Chuyển ngữ cảnh khi người dùng vào phòng họp mới (SPA navigation)
   */
  async function syncRoomContext() {
    const url = window.location.href;
    if (url === lastCheckedUrl && currentRoomId !== null) {
      return;
    }
    lastCheckedUrl = url;

    const roomId = getRoomIdFromUrl(url);
    if (roomId === currentRoomId) return;

    // Lưu dữ liệu phòng cũ trước khi chuyển
    if (currentRoomId) {
      scheduleSave(true);
    }

    currentRoomId = roomId;
    blockTrackMap = new WeakMap();
    attachContainerObserver(null);

    if (!currentRoomId) {
      entries = [];
      isRecording = false;
      return;
    }

    entries = await loadRoomEntries(currentRoomId);
    entryCounter = entries.length;
    scanCaptions();
    scheduleSave(true);
  }

  /**
   * Lắng nghe thông điệp từ Popup (lấy trạng thái, xóa dữ liệu)
   */
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || !message.type) return;

    if (message.type === 'GET_STATUS') {
      // Quét tức thì trước khi trả kết quả để luôn có dữ liệu mới nhất
      scanCaptions();
      sendResponse({
        roomId: currentRoomId,
        isRecording,
        entries
      });
      return;
    }

    if (message.type === 'CLEAR_CAPTIONS') {
      entries = [];
      entryCounter = 0;
      blockTrackMap = new WeakMap();
      if (currentRoomId) {
        const roomKey = `${STORAGE_PREFIX}${currentRoomId}`;
        chrome.storage.local.set(
          {
            [roomKey]: {
              roomId: currentRoomId,
              entries: [],
              isRecording,
              updatedAt: Date.now()
            }
          },
          () => {
            sendResponse({ success: true });
          }
        );
        return true;
      }
      sendResponse({ success: true });
    }
  });

  /**
   * Khởi tạo observer theo dõi toàn trang để bắt thời điểm vùng phụ đề được bật
   */
  function init() {
    syncRoomContext();

    bodyObserver = new MutationObserver(() => {
      if (window.location.href !== lastCheckedUrl) {
        syncRoomContext();
        return;
      }
      if (!captionContainer || !captionContainer.isConnected) {
        const found = findCaptionContainer();
        if (found) {
          attachContainerObserver(found);
          scheduleScan();
        }
      }
    });

    if (document.body) {
      bodyObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // Kiểm tra định kỳ trạng thái bật/tắt phụ đề và chuyển phòng SPA
    setInterval(() => {
      if (window.location.href !== lastCheckedUrl) {
        syncRoomContext();
      } else if (currentRoomId) {
        scanCaptions();
      }
    }, HEALTH_CHECK_MS);

    // Lưu ngay dữ liệu nếu người dùng đóng hoặc rời khỏi tab
    window.addEventListener('beforeunload', () => scheduleSave(true));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        scheduleSave(true);
      }
    });
  }

  init();
})();
