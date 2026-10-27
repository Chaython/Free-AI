// ==UserScript==
// @name         Chaython's Claude Auto Continue
// @namespace    https://claude.ai/
// @version      1.0.0
// @author       Chaython
// @description  Reads Claude's free-usage reset time and clicks Continue when it becomes available.
// @homepageURL  https://github.com/Chaython/Free-AI
// @updateURL    https://raw.githubusercontent.com/Chaython/Free-AI/main/Chaython%27s%20Claude%20Auto%20Continue.user.js
// @downloadURL  https://raw.githubusercontent.com/Chaython/Free-AI/main/Chaython%27s%20Claude%20Auto%20Continue.user.js
// @match        https://claude.ai/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const CHECK_INTERVAL_MS = 15000;
  const BANNER_SELECTOR = '[data-testid="message-warning"]';
  const LOG_PREFIX = '[Claude Auto Continue]';
  let scheduledFor = null;
  let scheduledTime = 0;
  let timerId = null;
  let lastClickAt = 0;

  const log = (...args) => console.info(LOG_PREFIX, ...args);
  const normalize = value => (value || '').replace(/\\s+/g, ' ').trim();

  function isVisible(element) {
    if (!element || !element.isConnected) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' &&
      style.opacity !== '0' && rect.width > 0 && rect.height > 0;
  }

  function parseResetTime(text, now = new Date()) {
    // Example: "Paused: Your free usage returns at 5:10 PM. Continue then."
    const match = text.match(/returns? at\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(a\\.?m\\.?|p\\.?m\\.?)/i);
    if (!match) return null;

    let hour = Number(match[1]);
    const minute = Number(match[2] || 0);
    const meridiem = match[3].replace(/\\./g, '').toLowerCase();
    if (hour < 1 || hour > 12 || minute > 59) return null;
    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);

    // Keep the already-scheduled deadline after it passes; otherwise a scan
    // at 5:10 PM would misread the same displayed time as tomorrow at 5:10 PM.
    if (scheduledTime &&
        new Date(scheduledTime).getHours() === hour &&
        new Date(scheduledTime).getMinutes() === minute) {
      return new Date(scheduledTime);
    }
    // If the displayed time has already passed and no deadline was captured,
    // assume the next occurrence is tomorrow rather than clicking immediately.
    if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
    return target;
  }

  function getBanner() {
    return [...document.querySelectorAll(BANNER_SELECTOR)].find(isVisible) || null;
  }

  function findContinueButton(banner) {
    if (!banner) return null;
    return [...banner.querySelectorAll('button, [role="button"]')].find(button => {
      if (!isVisible(button)) return false;
      const text = normalize([
        button.innerText,
        button.textContent,
        button.getAttribute('aria-label')
      ].filter(Boolean).join(' ')).toLowerCase();
      return text === 'continue' || text.includes('continue');
    }) || null;
  }

  function isEnabled(button) {
    return !!button &&
      !button.disabled &&
      button.getAttribute('aria-disabled') !== 'true' &&
      !button.hasAttribute('data-disabled');
  }

  function clearScheduledClick() {
    if (timerId !== null) clearTimeout(timerId);
    timerId = null;
  }

  function clickIfReady(expectedTime) {
    timerId = null;
    const banner = getBanner();
    if (!banner) {
      log('Reset time arrived, but the usage warning is no longer visible. Waiting for the page to update.');
      return;
    }

    const text = normalize(banner.innerText || banner.textContent);
    const button = findContinueButton(banner);
    if (isEnabled(button)) {
      if (Date.now() - lastClickAt < 5000) return;
      lastClickAt = Date.now();
      log('Reset time reached; clicking Continue.');
      button.click();
      scheduledFor = null;
      scheduledTime = 0;
      return;
    }

    // The banner may still show a disabled button briefly after the reset.
    // Retry soon rather than clicking anything outside the matching banner.
    timerId = setTimeout(() => clickIfReady(expectedTime), 3000);
  }

  function scheduleAt(target) {
    const timestamp = target.getTime();
    if (scheduledTime === timestamp && (timerId !== null || scheduledFor !== null)) return;

    clearScheduledClick();
    scheduledFor = target;
    scheduledTime = timestamp;
    const delay = Math.max(0, timestamp - Date.now());
    log('Detected free-usage reset at ' + target.toLocaleTimeString([], {
      hour: 'numeric', minute: '2-digit'
    }) + '. Will check Continue when that time arrives.');

    timerId = setTimeout(() => clickIfReady(timestamp), Math.min(delay, 2147480000));
  }

  function scan() {
    const banner = getBanner();
    if (!banner) return;

    const text = normalize(banner.innerText || banner.textContent);
    const target = parseResetTime(text);
    if (target) {
      scheduleAt(target);
      // Timers can be throttled in background tabs; periodically re-check
      // the deadline and button state while the banner remains visible.
      if (Date.now() >= target.getTime() && timerId === null) {
        timerId = setTimeout(() => clickIfReady(target.getTime()), 250);
      }
      return;
    }

    // If the banner is visible but its wording has changed, don't guess a time.
    if (/free usage|paused|continue then/i.test(text)) {
      log('Found a usage-pause banner, but could not parse its reset time:', text);
    }
  }

  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['disabled', 'aria-disabled', 'data-testid']
  });

  setInterval(scan, CHECK_INTERVAL_MS);
  scan();
  log('Loaded. Watching Claude usage-pause banners for a reset time.');
})();
