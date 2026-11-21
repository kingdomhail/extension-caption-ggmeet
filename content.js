/*!
 * Captions Recorder for Google Meet - Content Script
 * Copyright (c) 2026 Hải Lập Trình. All rights reserved.
 */
(() => {
  'use strict';

  const STORAGE_PREFIX = 'meet_captions_';
  const PEOPLE_PREFIX = 'meet_people_';
  const CHAT_PREFIX = 'meet_chat_';
  const LAST_ROOM_KEY = 'meet_captions_last_room';
  const MAX_CHAT_MESSAGES = 400;
  const SAVE_DEBOUNCE_MS = 300;
  const SCAN_THROTTLE_MS = 120;
  const HEALTH_CHECK_MS = 1500;
  const KEEP_MUTED_KEY = 'meet_keep_muted';
  const MUTE_COOLDOWN_MS = 700;
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
  let sideSaveTimer = null;
  let lastCheckedUrl = '';
  let people = [];
  let peoplePartial = true;
  let chatMessages = [];
  let peopleSignature = '';
  let chatSignature = '';
  const avatarByName = new Map();
  let keepMuted = false;
  let lastMuteClickAt = 0;
  let muteTimer = null;

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
   * Nút có nhãn "Tắt micrô" / "Turn off microphone" nghĩa là mic đang mở
   */
  function micIsOpen(label) {
    const text = String(label || '').replace(/\s+/g, ' ').trim();
    if (!text) return false;
    if (/turn on|unmute|bật/i.test(text)) return false;
    return /turn off microphone|mute microphone|tắt (tiếng )?(?:micrô|microphone|micro)(?!\p{L})/iu.test(text);
  }

  function findOpenMicButton() {
    const buttons = document.querySelectorAll('button[aria-label], [role="button"][aria-label]');
    for (const button of buttons) {
      if (!micIsOpen(button.getAttribute('aria-label'))) continue;
      if (button.disabled || button.getAttribute('aria-disabled') === 'true') continue;
      if (!isElementVisible(button)) continue;
      return button;
    }
    return null;
  }

  function enforceMute() {
    if (!keepMuted) return;
    if (Date.now() - lastMuteClickAt < MUTE_COOLDOWN_MS) return;
    const button = findOpenMicButton();
    if (!button) return;
    lastMuteClickAt = Date.now();
    button.click();
  }

  function scheduleMuteCheck() {
    if (!keepMuted || muteTimer) return;
    muteTimer = setTimeout(() => {
      muteTimer = null;
      enforceMute();
    }, 200);
  }

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
   * Khung chat cũng dùng aria-live. Không được lấy tin nhắn làm phụ đề.
   */
  function isChatSurface(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    if (el.closest('[jsname="xySENc"], [data-message-id*="/messages/"]')) return true;
    if (el.querySelector('[data-message-id*="/messages/"]')) return true;
    const label = `${el.getAttribute('aria-label') || ''} ${el.getAttribute('aria-controls') || ''}`.toLowerCase();
    if (/\b(chat|tin nhắn)\b/.test(label)) return true;
    return false;
  }

  /**
   * Tìm vùng chứa phụ đề (hỗ trợ Tiếng Việt, Tiếng Anh và fallback selector dự phòng)
   */
  function acceptCaptionRoot(el) {
    return Boolean(el) && !isExcludedControlElement(el) && !isChatSurface(el);
  }

  function findCaptionContainer() {
    // 1. Ưu tiên selector theo chuẩn aria-label Tiếng Việt & Tiếng Anh trên role="region"
    const regionCandidates = document.querySelectorAll(
      '[role="region"][aria-label*="Phụ đề" i], [role="region"][aria-label*="Captions" i]'
    );
    for (const el of regionCandidates) {
      if (acceptCaptionRoot(el)) return el;
    }

    // 2. Fallback: các thẻ div có aria-label chứa Phụ đề / Captions (loại trừ nút bấm & hộp thoại)
    const labelCandidates = document.querySelectorAll(
      'div[aria-label*="Phụ đề" i], div[aria-label*="Captions" i]'
    );
    for (const el of labelCandidates) {
      if (acceptCaptionRoot(el)) return el;
    }

    // 3. Fallback: class/jsname phổ biến của Google Meet nếu đổi aria-label
    const knownContainer =
      document.querySelector('.a4cQT') ||
      document.querySelector('div[jsname="dsyhDe"]');
    if (acceptCaptionRoot(knownContainer)) return knownContainer;

    // 4. Suy ngược từ dòng phụ đề, bỏ qua ảnh và chữ nằm trong khung chat
    const samples = document.querySelectorAll('[jsname="tgaKEf"], .nMcdL, .TBMuR, .iOzk7, [jsname="YSxPC"]');
    for (const sample of samples) {
      if (isChatSurface(sample)) continue;
      const regionParent = sample.closest('[role="region"]') || sample.parentElement;
      if (acceptCaptionRoot(regionParent)) return regionParent;
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
    if (!container || isChatSurface(container)) return [];

    const captionTexts = [...container.querySelectorAll('[jsname="tgaKEf"]')].filter((el) => !isChatSurface(el));
    if (captionTexts.length > 0) {
      const rows = [];
      const seen = new Set();
      for (const textNode of captionTexts) {
        let row = textNode;
        for (let depth = 0; depth < 5 && row.parentElement && row.parentElement !== container; depth += 1) {
          const parent = row.parentElement;
          if (isChatSurface(parent)) break;
          const onlyThisLine = parent.querySelectorAll('[jsname="tgaKEf"]').length === 1;
          if (onlyThisLine && avatarUrlIn(parent)) {
            row = parent;
            continue;
          }
          break;
        }
        if (!seen.has(row)) {
          seen.add(row);
          rows.push(row);
        }
      }
      if (rows.length > 0) return rows;
    }

    // 1. Dùng các selector block đã biết của Google Meet
    for (const selector of BLOCK_SELECTORS) {
      const matched = Array.from(container.querySelectorAll(selector)).filter(
        (el) => !isExcludedControlElement(el) && !isChatSurface(el)
      );
      if (matched.length > 0) {
        return matched.filter((el) => !matched.some((other) => other !== el && other.contains(el)));
      }
    }

    // 2. Fallback cấu trúc: một ảnh đại diện đi cùng chữ của đúng một lượt nói
    const avatarImgs = Array.from(container.querySelectorAll('img')).filter((img) => !isChatSurface(img));
    if (avatarImgs.length > 0) {
      const blockSet = new Set();
      for (const img of avatarImgs) {
        let candidate = img.parentElement;
        while (candidate && candidate.parentElement && candidate.parentElement !== container) {
          if (isChatSurface(candidate)) break;
          const textLen = extractCleanText(candidate).length;
          if (candidate.children.length >= 2 && textLen > 0) {
            const parentImgCount = [...candidate.parentElement.querySelectorAll('img')].filter((node) => !isChatSurface(node)).length;
            if (parentImgCount > 1 || candidate.parentElement === container) break;
          }
          candidate = candidate.parentElement;
        }
        if (candidate && candidate !== container && !isExcludedControlElement(candidate) && !isChatSurface(candidate)) {
          blockSet.add(candidate);
        }
      }
      if (blockSet.size > 0) return Array.from(blockSet);
    }

    const directChildren = Array.from(container.children).filter(
      (el) => !isExcludedControlElement(el) && !isChatSurface(el) && extractCleanText(el).length > 0
    );
    if (directChildren.length === 1 && directChildren[0].children.length > 1) {
      const grandChildren = Array.from(directChildren[0].children).filter(
        (el) => !isExcludedControlElement(el) && !isChatSurface(el) && extractCleanText(el).length > 0
      );
      if (grandChildren.length > 0) return grandChildren;
    }
    return directChildren;
  }

  /**
   * Tên người nói là đoạn chữ ngắn nằm cạnh câu phụ đề, không lấy chữ trong khung chat
   */
  function speakerNear(blockEl, textNode) {
    if (!blockEl) return '';
    let best = '';
    const nodes = [blockEl, ...blockEl.querySelectorAll('div, span')];
    for (const el of nodes) {
      if (textNode && (el === textNode || el.contains(textNode))) continue;
      if (isExcludedControlElement(el)) continue;
      const value = cleanPersonName(extractCleanText(el));
      if (!isPlausibleName(value)) continue;
      if (!best || value.length < best.length) best = value;
    }
    return best;
  }

  /**
   * Tách Tên người nói và Nội dung câu nói từ một block phụ đề
   */
  function parseCaptionBlock(blockEl, fallbackSpeaker) {
    if (!blockEl || isChatSurface(blockEl)) return null;

    const textNode = blockEl.matches('[jsname="tgaKEf"]')
      ? blockEl
      : blockEl.querySelector('[jsname="tgaKEf"]');
    if (textNode && !isChatSurface(textNode)) {
      const text = extractCleanText(textNode);
      const speaker = speakerNear(blockEl, textNode) || fallbackSpeaker || 'Speaker';
      if (text && !IGNORED_UI_TEXTS.has(text.toLowerCase())) {
        return { speaker, text, avatarUrl: avatarUrlIn(blockEl) };
      }
    }

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
      speaker = speakerNear(blockEl, speakerEl) || fallbackSpeaker || 'Speaker';
    }

    return { speaker, text, avatarUrl: avatarUrlIn(blockEl) };
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
  function createEntry(speaker, text, avatarUrl) {
    const now = Date.now();
    entryCounter += 1;
    return {
      id: `cap_${now}_${entryCounter}`,
      timestamp: formatLocalTime(new Date(now)),
      speaker,
      text,
      avatarUrl: avatarUrl || '',
      createdAt: now,
      updatedAt: now
    };
  }

  function assignAvatar(entry, avatarUrl) {
    if (!entry || !avatarUrl || entry.avatarUrl === avatarUrl) return false;
    entry.avatarUrl = avatarUrl;
    return true;
  }

  /**
   * Xử lý một block phụ đề và áp dụng logic chống trùng lặp / cập nhật câu đang nói
   */
  function upsertCaptionBlock(blockEl, speaker, text, avatarUrl) {
    const now = Date.now();
    if (avatarUrl) avatarByName.set(nameKey(speaker), avatarUrl);
    const photo = avatarUrl || avatarFor(speaker);
    const tracked = blockTrackMap.get(blockEl);

    if (tracked) {
      const existing = entries.find((item) => item.id === tracked.entryId);
      if (existing && existing.speaker === speaker) {
        const avatarChanged = assignAvatar(existing, photo);
        if (tracked.lastRawText === text) {
          return avatarChanged;
        }

        // Xử lý nếu Google Meet cắt bớt câu cũ ở đầu block quá dài
        const evictedPrefix = detectEvictedPrefix(tracked.lastRawText, text);
        if (evictedPrefix) {
          existing.text = evictedPrefix;
          existing.updatedAt = now;

          const nextEntry = createEntry(speaker, text, photo);
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
        const newEntry = createEntry(speaker, text, photo);
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
        return assignAvatar(candidate, photo);
      }

      // Chỉ gộp cập nhật vào dòng gần nhất của người đó (trong 2 dòng cuối)
      if (i >= entries.length - 2 && isSameUtteranceUpdate(candidate.text, text, now - candidate.updatedAt, false)) {
        // Tránh ghi đè bản dài đầy đủ bằng đoạn ngắn hơn bị cắt cũ
        if (!(normCand.startsWith(normNew) && normNew.length < normCand.length)) {
          candidate.text = text;
          candidate.updatedAt = now;
        }
        assignAvatar(candidate, photo);
        blockTrackMap.set(blockEl, {
          entryId: candidate.id,
          lastRawText: text,
          speaker
        });
        return true;
      }
    }

    // Đổi người nói hoặc sang câu mới -> tạo dòng mới với mốc thời gian thực
    const newEntry = createEntry(speaker, text, photo);
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
   * Bỏ các dòng phụ đề thực ra là tin chat đã đọc nhầm
   */
  function forgetChatLines() {
    if (chatMessages.length === 0 || entries.length === 0) return false;
    const chatNorms = chatMessages
      .map((message) => normalizeText(message.text))
      .filter((text) => text.length >= 12);
    if (chatNorms.length === 0) return false;
    const next = entries.filter((entry) => {
      const norm = normalizeText(entry.text);
      if (!norm) return true;
      return !chatNorms.some((chat) => norm === chat || (chat.length >= 40 && norm.includes(chat)));
    });
    if (next.length === entries.length) return false;
    entries = next;
    blockTrackMap = new WeakMap();
    return true;
  }

  /**
   * Quét toàn bộ block phụ đề hiện có trong container
   */
  function scanCaptions() {
    if (!currentRoomId) return;

    const container = captionContainer && captionContainer.isConnected && !isChatSurface(captionContainer)
      ? captionContainer
      : findCaptionContainer();

    if (container !== captionContainer) {
      attachContainerObserver(container);
    }

    const containerVisible = Boolean(container && isElementVisible(container));
    const nextRecordingState = containerVisible || isCaptionToggleButtonOn();

    let changed = false;
    if (forgetChatLines()) changed = true;
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
        if (upsertCaptionBlock(blockEl, parsed.speaker, parsed.text, parsed.avatarUrl)) {
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
      scheduleSideSave(true);
    }

    currentRoomId = roomId;
    blockTrackMap = new WeakMap();
    attachContainerObserver(null);
    people = [];
    peoplePartial = true;
    chatMessages = [];
    peopleSignature = '';
    chatSignature = '';
    avatarByName.clear();

    if (!currentRoomId) {
      entries = [];
      isRecording = false;
      return;
    }

    entries = await loadRoomEntries(currentRoomId);
    entryCounter = entries.length;
    const side = await loadSideData(currentRoomId);
    people = side.people;
    peoplePartial = side.partial;
    chatMessages = side.messages;
    rememberAvatarsFromPeople();
    for (const message of chatMessages) {
      if (message.avatarUrl && message.sender) avatarByName.set(nameKey(message.sender), message.avatarUrl);
    }
    scanCaptions();
    scanRoomLists();
    scheduleSave(true);
  }

  function nameKey(name) {
    return String(name || '').trim().toLowerCase();
  }

  function avatarFor(name) {
    return avatarByName.get(nameKey(name)) || '';
  }

  function rememberAvatarsFromPeople() {
    for (const person of people) {
      if (person.avatarUrl && person.name) avatarByName.set(nameKey(person.name), person.avatarUrl);
    }
  }

  /**
   * Ảnh đại diện là thẻ img của Google, không dựa vào class
   */
  function profileImageUrl(img) {
    if (!img || img.tagName !== 'IMG') return '';
    const src = img.currentSrc || img.src || img.getAttribute('src') || '';
    if (!/^https:\/\//i.test(src)) return '';
    if (!/googleusercontent\.com|ggpht\.com/i.test(src)) return '';
    const width = Number(img.getAttribute('width') || img.clientWidth || 0);
    const height = Number(img.getAttribute('height') || img.clientHeight || 0);
    if ((width && width < 20) || (height && height < 20)) return '';
    return src;
  }

  function styledImageUrl(el) {
    const style = (el && el.getAttribute && el.getAttribute('style')) || '';
    const match = style.match(/url\(["']?(https:\/\/[^"')]+)["']?\)/i);
    if (!match) return '';
    return /googleusercontent\.com|ggpht\.com/i.test(match[1]) ? match[1] : '';
  }

  function avatarUrlFromTree(root) {
    if (!root) return '';
    const imgs = root.tagName === 'IMG' ? [root] : (root.querySelectorAll ? root.querySelectorAll('img') : []);
    for (const img of imgs) {
      const url = profileImageUrl(img);
      if (url) return url;
    }
    const own = styledImageUrl(root);
    if (own) return own;
    const styled = root.querySelectorAll ? root.querySelectorAll('[style*="url"]') : [];
    for (const el of styled) {
      const url = styledImageUrl(el);
      if (url) return url;
    }
    return '';
  }

  function avatarUrlIn(root) {
    const direct = avatarUrlFromTree(root);
    if (direct || !root || !root.querySelectorAll) return direct;
    const hosts = root.querySelectorAll('*');
    for (const host of hosts) {
      if (!host.shadowRoot) continue;
      const nested = avatarUrlFromTree(host.shadowRoot);
      if (nested) return nested;
    }
    return '';
  }

  /**
   * Tên người tham gia hợp lệ, loại nút điều khiển của Meet
   */
  function isPlausibleName(name) {
    if (!name) return false;
    if (name.length < 1 || name.length > 60) return false;
    if (!/\p{L}/u.test(name)) return false;
    const words = name.split(/\s+/);
    if (words.length > 8) return false;
    const lowered = name.toLowerCase();
    const blocked = [
      'mute', 'unmute', 'microphone', 'camera', 'caption', 'captions', 'phụ đề',
      'chat', 'people', 'mọi người', 'pin', 'more options', 'more actions',
      'background', 'effects', 'present now', 'trình bày', 'tắt tiếng', 'bật tiếng',
      'giơ tay', 'raise hand', 'send a message', 'gửi tin nhắn'
    ];
    return !blocked.some((word) => lowered === word || lowered.startsWith(`${word} `));
  }

  /**
   * Bỏ hậu tố trạng thái trong nhãn của Meet, cả tiếng Anh và tiếng Việt
   */
  function cleanPersonName(raw) {
    if (!raw) return '';
    let text = String(raw).split('\n')[0].replace(/\s+/g, ' ').trim();
    text = text.replace(
      /\s*\((you|bạn|host|co-host|người tổ chức|đồng tổ chức|presenting|đang trình bày)\)\s*/gi,
      ' '
    );
    const comma = text.split(',')[0].trim();
    if (comma && comma.length < text.length && text.length - comma.length < 48) {
      text = comma;
    }
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Đọc tên từ một ô người tham gia hoặc một hàng trong bảng People
   */
  function readPerson(el) {
    const selfAttr = el.getAttribute('data-self-name')
      || el.querySelector('[data-self-name]')?.getAttribute('data-self-name')
      || '';
    const labels = [];
    if (selfAttr) labels.push(selfAttr);
    const ownLabel = el.getAttribute('aria-label');
    if (ownLabel) labels.push(ownLabel);
    const labeled = el.querySelectorAll('[aria-label]');
    for (let i = 0; i < labeled.length && i < 6; i += 1) {
      labels.push(labeled[i].getAttribute('aria-label'));
    }

    for (const label of labels) {
      const name = cleanPersonName(label);
      if (!isPlausibleName(name)) continue;
      const isSelf = Boolean(selfAttr) || /\((you|bạn)\)/i.test(label || '');
      return { name, isSelf, avatarUrl: avatarUrlIn(el) };
    }
    return null;
  }

  /**
   * Gộp các phần tử có cùng mã người, giữ tên rõ nhất
   */
  function peopleFromNodes(nodes) {
    const found = new Map();
    for (const el of nodes) {
      const id = el.getAttribute('data-participant-id');
      if (!id) continue;
      const info = readPerson(el);
      if (!info) continue;
      const prev = found.get(id);
      if (!prev || info.name.length > prev.name.length) {
        found.set(id, {
          id,
          name: info.name,
          isSelf: info.isSelf || Boolean(prev && prev.isSelf),
          avatarUrl: info.avatarUrl || (prev && prev.avatarUrl) || ''
        });
      } else {
        if (info.isSelf) prev.isSelf = true;
        if (!prev.avatarUrl && info.avatarUrl) prev.avatarUrl = info.avatarUrl;
      }
    }
    return [...found.values()].sort((a, b) => {
      if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Danh sách người: bảng People đang mở thì lấy đủ, không thì lấy người đang hiện trên màn hình
   */
  function scanPeople() {
    const panelNodes = document.querySelectorAll('[role="listitem"][data-participant-id]');
    if (panelNodes.length > 0) {
      const roster = peopleFromNodes(panelNodes);
      if (roster.length > 0) {
        people = roster;
        peoplePartial = false;
        rememberAvatarsFromPeople();
        return;
      }
    }

    const tiles = document.querySelectorAll('[data-participant-id]');
    const visible = peopleFromNodes(tiles);
    if (visible.length === 0) return;
    people = visible;
    peoplePartial = true;
    rememberAvatarsFromPeople();
  }

  const CHAT_MESSAGE_XPATH = './/*[@data-message-id and contains(@data-message-id, "/messages/")]';
  const CHAT_TIME_PATTERN = /^(\d{1,2}:\d{2})(\s*[AP]M)?$/i;

  function normalizeSpaces(value) {
    return String(value || '')
      .replace(/[\u00A0\u202F\u2007]/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function parentAcrossShadow(node) {
    if (!node) return null;
    if (node.parentElement) return node.parentElement;
    const root = node.getRootNode && node.getRootNode();
    return root && root.host ? root.host : null;
  }

  /**
   * XPath theo data-message-id. Thuộc tính này là mã tin của Meet, không phải class.
   */
  function evaluateMessageNodes(root) {
    if (!root) return [];
    if (document.evaluate) {
      try {
        const snapshot = document.evaluate(
          CHAT_MESSAGE_XPATH,
          root,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        const nodes = [];
        for (let i = 0; i < snapshot.snapshotLength; i += 1) {
          nodes.push(snapshot.snapshotItem(i));
        }
        if (nodes.length > 0) return nodes;
      } catch (error) {
        // Shadow root không phải context XPath hợp lệ thì đọc bằng thuộc tính bên dưới.
      }
    }
    if (!root.querySelectorAll) return [];
    return [...root.querySelectorAll('[data-message-id*="/messages/"]')];
  }

  function forEachOpenShadow(visitor) {
    const queue = [document];
    const seen = new Set();
    while (queue.length > 0) {
      const root = queue.shift();
      if (!root || seen.has(root)) continue;
      seen.add(root);
      const elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
      elements.forEach((el) => {
        if (el.shadowRoot) queue.push(el.shadowRoot);
      });
      if (root !== document) visitor(root);
    }
  }

  /**
   * Chỉ giữ bong bóng trong cùng, bỏ khung cha cũng mang data-message-id
   */
  function chatMessageNodes() {
    const found = evaluateMessageNodes(document);
    if (found.length === 0) {
      forEachOpenShadow((root) => {
        evaluateMessageNodes(root).forEach((node) => found.push(node));
      });
    }
    return found.filter((node) => node && !node.querySelector('[data-message-id*="/messages/"]'));
  }

  function leafTexts(root) {
    const texts = [];
    const walk = (el) => {
      const children = [...el.children].filter((child) => child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE');
      if (children.length === 0) {
        const text = normalizeSpaces(el.textContent || '').replace(/\s+/g, ' ');
        if (text) texts.push(text);
        return;
      }
      children.forEach(walk);
    };
    walk(root);
    return texts;
  }

  /**
   * Tên và giờ là chữ ngắn ở khối ngay trước bong bóng, không dựa vào class
   */
  function readNearbyMeta(node) {
    let current = node;
    for (let depth = 0; depth < 6 && current; depth += 1) {
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (!sibling.querySelector('[data-message-id*="/messages/"]')) {
          const texts = leafTexts(sibling);
          const joined = texts.join(' ');
          if (joined.length > 0 && joined.length <= 120) {
            const timeLabel = texts.find((text) => CHAT_TIME_PATTERN.test(text)) || '';
            const senderName = texts
              .map((text) => cleanPersonName(text))
              .find((text) => text && text !== timeLabel && !CHAT_TIME_PATTERN.test(text) && isPlausibleName(text)) || '';
            if (timeLabel || senderName) {
              return { senderName, timeLabel, avatarUrl: avatarBeside(current) || avatarUrlIn(sibling) };
            }
          }
        }
        sibling = sibling.previousElementSibling;
      }
      current = parentAcrossShadow(current);
    }
    return { senderName: '', timeLabel: '', avatarUrl: '' };
  }

  /**
   * Ảnh thường đứng ngay trước khối tên, cùng hàng với bong bóng
   */
  function avatarBeside(node) {
    let current = node;
    for (let depth = 0; depth < 5 && current; depth += 1) {
      let sibling = current.previousElementSibling;
      while (sibling) {
        const url = avatarUrlIn(sibling);
        if (url) return url;
        sibling = sibling.previousElementSibling;
      }
      current = parentAcrossShadow(current);
    }
    return '';
  }

  /**
   * Tách một bong bóng chat của Meet thành người gửi, giờ và nội dung
   */
  function parseChatNode(node, previousSender) {
    const id = node.getAttribute('data-message-id') || '';
    if (!id.includes('/messages/')) return null;

    const text = normalizeSpaces(node.innerText || node.textContent || '');
    if (!text || text.length > 8000) return null;

    const meta = readNearbyMeta(node);
    const sender = isPlausibleName(meta.senderName) ? meta.senderName : (previousSender || 'Unknown');
    const avatarUrl = meta.avatarUrl || avatarFor(sender);
    if (avatarUrl && sender !== 'Unknown') avatarByName.set(nameKey(sender), avatarUrl);
    return { id, sender, text, timeLabel: meta.timeLabel, avatarUrl };
  }

  /**
   * Đọc các tin đang có trong bảng chat và gộp vào lịch sử của phòng
   */
  function scanChat() {
    const nodes = chatMessageNodes();
    if (nodes.length === 0) return;

    const byId = new Map(chatMessages.map((message) => [message.id, message]));
    let previousSender = '';
    let previousAvatar = '';
    let changed = false;

    for (const node of nodes) {
      const parsed = parseChatNode(node, previousSender);
      if (!parsed) continue;
      if (!parsed.avatarUrl && parsed.sender === previousSender) parsed.avatarUrl = previousAvatar;
      if (parsed.sender !== 'Unknown') {
        previousSender = parsed.sender;
        if (parsed.avatarUrl) previousAvatar = parsed.avatarUrl;
      }
      const prev = byId.get(parsed.id);
      if (!prev) {
        byId.set(parsed.id, {
          id: parsed.id,
          sender: parsed.sender,
          text: parsed.text,
          timeLabel: parsed.timeLabel,
          avatarUrl: parsed.avatarUrl || '',
          capturedAt: Date.now()
        });
        changed = true;
        continue;
      }
      const nextAvatar = parsed.avatarUrl || prev.avatarUrl || '';
      if (prev.text !== parsed.text || prev.sender !== parsed.sender || prev.timeLabel !== parsed.timeLabel || prev.avatarUrl !== nextAvatar) {
        prev.text = parsed.text;
        prev.sender = parsed.sender;
        prev.timeLabel = parsed.timeLabel;
        prev.avatarUrl = nextAvatar;
        changed = true;
      }
    }

    if (!changed && byId.size === chatMessages.length) return;
    const next = [...byId.values()];
    chatMessages = next.slice(-MAX_CHAT_MESSAGES);
  }

  /**
   * Quét người và chat, chỉ ghi storage khi nội dung đổi
   */
  function scanRoomLists() {
    if (!currentRoomId) return;
    scanPeople();
    scanChat();
    if (forgetChatLines()) scheduleSave(false);

    const nextPeopleSignature = `${peoplePartial ? 1 : 0}|${people.map((person) => `${person.id}|${person.name}|${person.isSelf ? 1 : 0}|${person.avatarUrl || ''}`).join('\n')}`;
    const nextChatSignature = chatMessages.map((message) => `${message.id}|${message.sender}|${message.timeLabel}|${message.avatarUrl || ''}|${message.text}`).join('\n');
    if (nextPeopleSignature === peopleSignature && nextChatSignature === chatSignature) return;
    peopleSignature = nextPeopleSignature;
    chatSignature = nextChatSignature;
    scheduleSideSave(false);
  }

  /**
   * Lưu danh sách người và chat theo mã phòng
   */
  function scheduleSideSave(immediate = false) {
    if (!currentRoomId) return;
    const roomId = currentRoomId;
    const persist = () => {
      sideSaveTimer = null;
      if (roomId !== currentRoomId) return;
      try {
        chrome.storage.local.set({
          [`${PEOPLE_PREFIX}${roomId}`]: {
            roomId,
            partial: peoplePartial,
            people,
            updatedAt: Date.now()
          },
          [`${CHAT_PREFIX}${roomId}`]: {
            roomId,
            messages: chatMessages,
            updatedAt: Date.now()
          },
          [LAST_ROOM_KEY]: roomId
        });
      } catch {
        // Extension context có thể đã bị reload
      }
    };

    if (immediate) {
      if (sideSaveTimer) {
        clearTimeout(sideSaveTimer);
        sideSaveTimer = null;
      }
      persist();
      return;
    }
    if (sideSaveTimer) return;
    sideSaveTimer = setTimeout(persist, SAVE_DEBOUNCE_MS);
  }

  /**
   * Tải danh sách người và chat đã lưu của một phòng
   */
  function loadSideData(roomId) {
    return new Promise((resolve) => {
      if (!roomId) {
        resolve({ people: [], partial: true, messages: [] });
        return;
      }
      const peopleKey = `${PEOPLE_PREFIX}${roomId}`;
      const chatKey = `${CHAT_PREFIX}${roomId}`;
      try {
        chrome.storage.local.get([peopleKey, chatKey], (result) => {
          if (chrome.runtime.lastError) {
            resolve({ people: [], partial: true, messages: [] });
            return;
          }
          const peopleRecord = result[peopleKey] || {};
          const chatRecord = result[chatKey] || {};
          resolve({
            people: Array.isArray(peopleRecord.people) ? peopleRecord.people : [],
            partial: peopleRecord.partial !== false,
            messages: Array.isArray(chatRecord.messages) ? chatRecord.messages : []
          });
        });
      } catch {
        resolve({ people: [], partial: true, messages: [] });
      }
    });
  }

  /**
   * Lắng nghe thông điệp từ Popup (lấy trạng thái, xóa dữ liệu)
   */
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || !message.type) return;

    if (message.type === 'SET_KEEP_MUTED') {
      keepMuted = Boolean(message.enabled);
      if (keepMuted) enforceMute();
      sendResponse({ success: true, enabled: keepMuted });
      return;
    }

    if (message.type === 'GET_STATUS') {
      // Quét tức thì trước khi trả kết quả để luôn có dữ liệu mới nhất
      scanCaptions();
      scanRoomLists();
      sendResponse({
        roomId: currentRoomId,
        isRecording,
        entries,
        people,
        peoplePartial,
        chat: chatMessages
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
      scheduleMuteCheck();
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
        scanRoomLists();
      }
      if (keepMuted) enforceMute();
    }, HEALTH_CHECK_MS);

    chrome.storage.local.get([KEEP_MUTED_KEY], (result) => {
      keepMuted = Boolean(result[KEEP_MUTED_KEY]);
      if (keepMuted) enforceMute();
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local' || !changes[KEEP_MUTED_KEY]) return;
      keepMuted = Boolean(changes[KEEP_MUTED_KEY].newValue);
      if (keepMuted) enforceMute();
    });

    // Lưu ngay dữ liệu nếu người dùng đóng hoặc rời khỏi tab
    window.addEventListener('beforeunload', () => {
      scheduleSave(true);
      scheduleSideSave(true);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        scheduleSave(true);
        scheduleSideSave(true);
      }
    });
  }

  init();
})();
