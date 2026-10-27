// ==UserScript==
// @name         Chaython's Z.ai Auto Retry
// @namespace    https://chat.z.ai/
// @version      1.0.0
// @author       Chaython
// @description  Dismisses Z.ai capacity warnings and retries the last prompt with bounded backoff.
// @homepageURL  https://github.com/Chaython
// @match        https://chat.z.ai/*
// @match        https://z.ai/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const MAX_RETRIES = 10;
  const FIRST_RETRY_DELAY_MS = 3000;
  const MAX_RETRY_DELAY_MS = 30000;
  const SEND_SELECTOR = '#send-message-button';
  const CAPACITY_TERMS = [
    'too many people',
    'too many requests',
    'at capacity',
    'server is busy',
    'servers are busy',
    'high demand',
    'try again later',
    'overloaded'
  ];

  let savedPrompt = '';
  let retryCount = 0;
  let retryTimer = null;
  let handlingDialog = false;
  let lastSubmitAt = 0;

  const log = (...args) => console.info('[Z.ai Auto Retry]', ...args);
  const normalize = value => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  function visible(el) {
    if (!el || !el.isConnected) return false;
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' &&
      rect.width > 0 && rect.height > 0;
  }

  function getComposer() {
    const candidates = [...document.querySelectorAll(
      'textarea, [contenteditable="true"], [role="textbox"]'
    )].filter(el => visible(el) && !el.matches('[readonly], [disabled]'));
    candidates.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      return br.width * br.height - ar.width * ar.height;
    });
    return candidates[0] || null;
  }

  function readComposer(el = getComposer()) {
    if (!el) return '';
    return 'value' in el ? (el.value || '') : (el.innerText || el.textContent || '');
  }

  function setComposerText(el, value) {
    if (!el) return false;
    el.focus();
    if ('value' in el) {
      const proto = el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(el, value);
      else el.value = value;
    } else {
      el.textContent = value;
    }
    el.dispatchEvent(new InputEvent('input', {
      bubbles: true, inputType: 'insertText', data: value
    }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function capturePrompt(reason) {
    const prompt = readComposer().trim();
    if (!prompt) return;
    savedPrompt = prompt;
    retryCount = 0;
    lastSubmitAt = Date.now();
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null;
    log('Captured prompt (' + reason + '), length:', prompt.length);
  }

  function findCapacityDialog() {
    const candidates = [...document.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], [class*="modal"], [class*="dialog"], [class*="toast"], [class*="notification"]'
    )].filter(visible);
    return candidates.find(el => {
      const text = normalize(el.innerText || el.textContent);
      return text && CAPACITY_TERMS.some(term => text.includes(term));
    }) || null;
  }

  function findDismissButton(dialog) {
    const buttons = [...dialog.querySelectorAll('button, [role="button"]')].filter(visible);
    const preferred = buttons.find(button => {
      const text = normalize(button.innerText || button.textContent);
      return /^(cancel|close|dismiss|ok|got it|retry|try again)$/.test(text) ||
        button.getAttribute('aria-label')?.toLowerCase().includes('close');
    });
    return preferred || buttons.find(button => {
      const text = normalize(button.innerText || button.textContent);
      return !/upgrade|subscribe|plan|membership/.test(text);
    }) || null;
  }

  function findSendButton() {
    const exact = document.querySelector(SEND_SELECTOR);
    if (exact && visible(exact) && !exact.disabled &&
        exact.getAttribute('aria-disabled') !== 'true') return exact;

    const candidates = [...document.querySelectorAll(
      'button[type="submit"], button[aria-label*="send" i], button[data-testid*="send" i]'
    )].filter(el => visible(el) && !el.disabled &&
      el.getAttribute('aria-disabled') !== 'true');
    return candidates[0] || null;
  }

  function scheduleRetry() {
    if (retryTimer) clearTimeout(retryTimer);
    if (retryCount >= MAX_RETRIES) {
      log('Retry limit reached; stopped to avoid repeated submissions.');
      return;
    }
    retryCount += 1;
    const delay = Math.min(
      FIRST_RETRY_DELAY_MS * (2 ** (retryCount - 1)),
      MAX_RETRY_DELAY_MS
    );
    log('Capacity warning detected. Retry ' + retryCount + '/' + MAX_RETRIES +
      ' in ' + Math.round(delay / 1000) + ' seconds.');
    retryTimer = setTimeout(() => {
      retryTimer = null;
      retryPrompt();
    }, delay);
  }

  function retryPrompt() {
    if (!savedPrompt) {
      log('No captured prompt; cannot retry.');
      return;
    }
    if (findCapacityDialog()) {
      log('Capacity warning is still visible; waiting for the next DOM change.');
      return;
    }

    const composer = getComposer();
    if (!composer) {
      log('Composer not found; stopped.');
      return;
    }
    const current = readComposer(composer).trim();
    if (current && current !== savedPrompt) {
      log('A different draft is present. Stopped to protect it.');
      return;
    }
    if (!current) setComposerText(composer, savedPrompt);

    setTimeout(() => {
      if (findCapacityDialog()) return;
      const send = findSendButton();
      if (!send) {
        log('Send button not found; stopped.');
        return;
      }
      lastSubmitAt = Date.now();
      send.click();
      log('Clicked send to retry the saved prompt.');
    }, 400);
  }

  function handleCapacityWarning() {
    if (handlingDialog) return;
    const dialog = findCapacityDialog();
    if (!dialog) return;

    if (!savedPrompt || Date.now() - lastSubmitAt > 30 * 60 * 1000) {
      log('Capacity warning found, but there is no recent captured prompt.');
      return;
    }

    const dismiss = findDismissButton(dialog);
    if (!dismiss) {
      log('Capacity warning found, but no safe dismiss button was found.');
      return;
    }

    handlingDialog = true;
    log('Capacity warning detected; dismissing it.');
    dismiss.click();
    setTimeout(() => {
      handlingDialog = false;
      if (!findCapacityDialog()) scheduleRetry();
    }, 500);
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const send = target.closest(SEND_SELECTOR +
      ', button[type="submit"], button[aria-label*="send" i], button[data-testid*="send" i]');
    if (send) capturePrompt('send click');
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
    const composer = getComposer();
    if (composer && (event.target === composer || composer.contains(event.target))) {
      capturePrompt('Enter key');
    }
  }, true);

  document.addEventListener('submit', event => {
    if (event.target instanceof HTMLFormElement) capturePrompt('form submit');
  }, true);

  const observer = new MutationObserver(handleCapacityWarning);
  observer.observe(document.documentElement, {
    childList: true, subtree: true, characterData: true
  });
  setInterval(handleCapacityWarning, 1000);
  log('Loaded. Waiting for a prompt and a Z.ai capacity warning.');
})();
