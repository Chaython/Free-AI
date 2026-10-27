// ==UserScript==
// @name         Chaython's ChatGPT Auto Continue
// @namespace    https://chatgpt.com/
// @version      1.1.0
// @author       Chaython
// @description  Clicks Continue when available, or submits "continue" if a response appears to have stopped mid-thought.
// @homepageURL  https://github.com/Chaython/Free-AI
// @updateURL    https://raw.githubusercontent.com/Chaython/Free-AI/main/Chaython%27s%20ChatGPT%20Auto%20Continue.user.js
// @downloadURL  https://raw.githubusercontent.com/Chaython/Free-AI/main/Chaython%27s%20ChatGPT%20Auto%20Continue.user.js
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const MAX_CONTINUES_PER_TURN = 8;
  const CHECK_INTERVAL_MS = 1500;
  const CLICK_COOLDOWN_MS = 7000;
  const STOPPED_SETTLE_MS = 10000;

  let lastTurn = null;
  let continueCount = 0;
  let lastActionAt = 0;
  let lastText = '';
  let lastTextChangeAt = 0;
  let handledText = '';
  let scheduledCheck = null;

  const log = (...args) => console.info('[ChatGPT Auto Continue]', ...args);
  const normalize = value => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  function isVisible(element) {
    if (!element || !element.isConnected) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' &&
      style.opacity !== '0' && rect.width > 0 && rect.height > 0;
  }

  function buttonLabel(button) {
    return normalize([
      button.innerText,
      button.getAttribute('aria-label'),
      button.getAttribute('data-testid'),
      button.getAttribute('title')
    ].filter(Boolean).join(' '));
  }

  function getLatestAssistantTurn() {
    const turns = [...document.querySelectorAll('main [data-testid^="conversation-turn-"], main article')]
      .filter(isVisible);
    for (let i = turns.length - 1; i >= 0; i--) {
      const turn = turns[i];
      if (turn.querySelector('[data-message-author-role="assistant"]') ||
          normalize(turn.getAttribute('data-message-author-role')) === 'assistant') return turn;
    }
    const messages = [...document.querySelectorAll('main [data-message-author-role="assistant"]')]
      .filter(isVisible);
    return messages[messages.length - 1]?.closest('[data-testid^="conversation-turn-"], article') ||
      messages[messages.length - 1] || null;
  }

  function assistantText(turn) {
    const node = turn?.querySelector('[data-message-author-role="assistant"]') || turn;
    return (node?.innerText || node?.textContent || '').trim();
  }

  function isGenerating() {
    return [...document.querySelectorAll('main button')].filter(isVisible).some(button => {
      const label = buttonLabel(button);
      return label.includes('stop generating') || label.includes('stop streaming') ||
        button.getAttribute('data-testid') === 'stop-button';
    });
  }

  function findContinueButton(turn) {
    if (!turn) return null;
    const buttons = [...turn.querySelectorAll('button, [role="button"]')].filter(isVisible);
    return buttons.find(button => {
      const label = buttonLabel(button);
      return label.includes('continue generating') || label.includes('continue response') ||
        label === 'continue-button' || label.includes('continue generation') ||
        normalize(button.innerText || button.textContent) === 'continue';
    }) || null;
  }

  function findComposer() {
    const candidates = [
      ...document.querySelectorAll('main textarea, main [contenteditable="true"], main [role="textbox"]')
    ].filter(isVisible).filter(element =>
      !element.closest('[data-message-author-role="assistant"]') &&
      !element.disabled && element.getAttribute('aria-disabled') !== 'true'
    );
    return candidates.find(element =>
      element.matches('textarea') ||
      element.getAttribute('data-testid') === 'prompt-textarea' ||
      element.getAttribute('placeholder')?.toLowerCase().includes('message') ||
      element.getAttribute('aria-label')?.toLowerCase().includes('message')
    ) || candidates[candidates.length - 1] || null;
  }

  function composerText(composer) {
    if (!composer) return '';
    return (('value' in composer ? composer.value : composer.innerText || composer.textContent) || '').trim();
  }

  function setComposerText(composer, value) {
    composer.focus();
    if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(composer), 'value')?.set;
      if (setter) setter.call(composer, value);
      else composer.value = value;
      composer.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
      composer.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    composer.replaceChildren();
    composer.appendChild(document.createTextNode(value));
    composer.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
  }

  function sendComposer(composer) {
    const root = composer.closest('form') || document.querySelector('main');
    const buttons = [...(root?.querySelectorAll('button') || [])].filter(isVisible);
    const send = buttons.find(button => {
      const label = buttonLabel(button);
      return label.includes('send message') || label === 'send' ||
        button.getAttribute('data-testid') === 'send-button';
    });
    if (send && !send.disabled && send.getAttribute('aria-disabled') !== 'true') {
      send.click();
      return true;
    }
    composer.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', code: 'Enter', bubbles: true, cancelable: true
    }));
    composer.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter', code: 'Enter', bubbles: true, cancelable: true
    }));
    return true;
  }

  function looksTruncated(text) {
    const clean = text.trim();
    if (clean.length < 80) return false;
    const lastLine = clean.split('\n').filter(line => line.trim()).pop() || '';
    if (clean.endsWith(String.fromCharCode(96, 96, 96)) ||
        /[.!?。！？][”’"')\]]*\s*$/.test(lastLine)) return false;
    return /[,;:—–…([{\/]\s*$/.test(lastLine) ||
      /\b(the|a|an|and|or|but|because|with|to|of|for|in|on|that|which|as|is|are|was|were|will|would|can|could|should|if|when|while|from|by|into|such|including|e\.g\.)$/i.test(lastLine) ||
      /\w$/.test(lastLine);
  }

  function actOnStoppedResponse(turn, text) {
    if (continueCount >= MAX_CONTINUES_PER_TURN) {
      log('Reached the per-response limit; stopping.');
      return;
    }
    const now = Date.now();
    if (now - lastActionAt < CLICK_COOLDOWN_MS) return;

    const button = findContinueButton(turn);
    if (button && !button.disabled && button.getAttribute('aria-disabled') !== 'true') {
      lastActionAt = now;
      continueCount++;
      handledText = text;
      log('Clicking visible Continue button (' + continueCount + '/' + MAX_CONTINUES_PER_TURN + ').');
      button.click();
      return;
    }

    if (now - lastTextChangeAt < STOPPED_SETTLE_MS || !looksTruncated(text) || handledText === text) return;
    const composer = findComposer();
    if (!composer) return;
    if (composerText(composer) !== '') {
      log('Fallback skipped because the composer is not empty.');
      return;
    }

    setComposerText(composer, 'continue');
    if (normalize(composerText(composer)) !== 'continue') {
      log('Could not safely set the composer text; not submitting.');
      return;
    }

    lastActionAt = now;
    continueCount++;
    handledText = text;
    log('No Continue button found; submitting "continue" (' + continueCount + '/' + MAX_CONTINUES_PER_TURN + ').');
    sendComposer(composer);
  }

  function checkAndContinue() {
    scheduledCheck = null;
    const turn = getLatestAssistantTurn();
    if (!turn) return;
    const text = assistantText(turn);
    if (!text) return;

    if (turn !== lastTurn) {
      lastTurn = turn;
      continueCount = 0;
      lastActionAt = 0;
      lastText = '';
      lastTextChangeAt = Date.now();
      handledText = '';
    }

    if (text !== lastText) {
      lastText = text;
      lastTextChangeAt = Date.now();
      return;
    }
    if (isGenerating()) return;
    actOnStoppedResponse(turn, text);
  }

  function scheduleCheck() {
    if (scheduledCheck !== null) return;
    scheduledCheck = setTimeout(checkAndContinue, 350);
  }

  const observer = new MutationObserver(scheduleCheck);
  observer.observe(document.documentElement, {
    childList: true, subtree: true, characterData: true, attributes: true,
    attributeFilter: ['aria-label', 'data-testid', 'disabled', 'aria-disabled']
  });
  setInterval(checkAndContinue, CHECK_INTERVAL_MS);
  log('Loaded. Watching for stopped responses and Continue controls.');
})();
