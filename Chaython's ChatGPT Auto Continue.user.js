// ==UserScript==
// @name         Chaython's ChatGPT Auto Continue
// @namespace    https://chatgpt.com/
// @version      1.0.0
// @author       Chaython
// @description  Automatically clicks Continue when ChatGPT stops generating a response.
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
  const CLICK_COOLDOWN_MS = 6000;

  let lastTurn = null;
  let continueCount = 0;
  let lastClickAt = 0;
  let scheduledCheck = null;

  const log = (...args) => console.info('[ChatGPT Auto Continue]', ...args);
  const normalize = value => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  function isVisible(element) {
    if (!element || !element.isConnected) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0;
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
      const role = normalize(turn.getAttribute('data-message-author-role') ||
        turn.querySelector('[data-message-author-role]')?.getAttribute('data-message-author-role') ||
        '');
      if (role === 'assistant' || turn.querySelector('[data-message-author-role="assistant"]')) {
        return turn;
      }
    }

    const messages = [...document.querySelectorAll('main [data-message-author-role="assistant"]')]
      .filter(isVisible);
    return messages[messages.length - 1]?.closest('[data-testid^="conversation-turn-"], article') ||
      messages[messages.length - 1] ||
      null;
  }

  function isGenerating() {
    const buttons = [...document.querySelectorAll('main button')].filter(isVisible);
    return buttons.some(button => {
      const label = buttonLabel(button);
      return label.includes('stop generating') ||
        label.includes('stop streaming') ||
        button.getAttribute('data-testid') === 'stop-button';
    });
  }

  function findContinueButton(turn) {
    if (!turn) return null;
    const buttons = [...turn.querySelectorAll('button, [role="button"]')].filter(isVisible);
    const explicit = buttons.find(button => {
      const label = buttonLabel(button);
      return label.includes('continue generating') ||
        label.includes('continue response') ||
        label === 'continue-button' ||
        label.includes('continue generation');
    });
    if (explicit) return explicit;

    return buttons.find(button => {
      const label = normalize(button.innerText || button.textContent);
      return label === 'continue' &&
        !button.disabled &&
        button.getAttribute('aria-disabled') !== 'true';
    }) || null;
  }

  function checkAndContinue() {
    scheduledCheck = null;
    const turn = getLatestAssistantTurn();
    if (!turn) return;

    if (turn !== lastTurn) {
      lastTurn = turn;
      continueCount = 0;
      lastClickAt = 0;
    }

    if (isGenerating()) return;
    const button = findContinueButton(turn);
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;

    if (continueCount >= MAX_CONTINUES_PER_TURN) {
      log('Reached the per-response continuation limit; stopping for this response.');
      return;
    }

    const now = Date.now();
    if (now - lastClickAt < CLICK_COOLDOWN_MS) return;

    lastClickAt = now;
    continueCount += 1;
    log('Clicking Continue (' + continueCount + '/' + MAX_CONTINUES_PER_TURN + ').');
    button.click();
  }

  function scheduleCheck() {
    if (scheduledCheck !== null) return;
    scheduledCheck = setTimeout(checkAndContinue, 350);
  }

  const observer = new MutationObserver(scheduleCheck);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['aria-label', 'data-testid', 'disabled', 'aria-disabled']
  });

  setInterval(checkAndContinue, CHECK_INTERVAL_MS);
  log('Loaded. Watching for a Continue control after a response stops.');
})();
