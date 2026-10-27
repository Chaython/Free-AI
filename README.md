# Free AI — Chaython

A collection of userscripts that improve the experience of using AI chat websites, including automatic continuation after a response stops and retries for temporary capacity errors.

These scripts automate visible website controls. They do not provide paid access or bypass subscriptions, access controls, or service-side usage limits.

## Userscripts

| Script | Service | What it does |
|---|---|---|
| [Chaython's ChatGPT Auto Continue](./Chaython%27s%20ChatGPT%20Auto%20Continue.user.js) | [ChatGPT](https://chatgpt.com/) | Clicks the visible **Continue** control when available; if it is absent and the answer appears cut off mid-thought, waits and submits `continue` in an empty composer. Limited to 8 attempts per response. |
| [Chaython's Claude Auto Continue](./Chaython%27s%20Claude%20Auto%20Continue.user.js) | [Claude](https://claude.ai/chat/) | Reads the reset time from Claude's free-usage pause banner, waits until that local time, then clicks **Continue** when the banner's button becomes enabled. |
| [Chaython's Kimi K3 Auto Retry](./Chaython%27s%20Kimi%20K3%20Auto%20Retry) | [Kimi](https://www.kimi.ai/) | Detects Kimi's “Too many people are chatting with Kimi” dialog, dismisses it, and retries the captured prompt. |
| [Chaython's Z.ai Auto Retry](./Chaython%27s%20Z.ai%20Auto%20Retry.user.js) | [Z.ai](https://chat.z.ai/) | Detects a Z.ai capacity/overload warning, dismisses it, and retries the last prompt. |

## Install

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/).
2. Open the script's **raw** GitHub URL, or install it from the userscript manager using the raw URL.
3. Review the script permissions and code, then confirm installation.
4. Visit the matching AI website.

Each script includes `@updateURL` and `@downloadURL` metadata pointing to its raw file in this repository, so Tampermonkey can check for updates.

## Safety and behavior

- ChatGPT Auto Continue clicks a visible Continue control when available. If none appears, it can submit `continue` after a response appears to stop mid-thought. The fallback waits 10 seconds, only uses an empty composer, and allows up to 8 continuation attempts per response.
- Claude Auto Continue only acts on Claude's usage-pause warning and its **Continue** button. It interprets the displayed reset time using the browser's local timezone; keep the Claude tab open, because browsers may throttle timers in background tabs.
- The Kimi and Z.ai scripts cap retries and avoid replacing a different draft where supported.
- Website interfaces can change, so selectors may need maintenance.
- These scripts cannot guarantee that a response will complete.
- Review userscript code before installing it, and only install scripts you trust.

## Support

Found a bug or a site UI change? Please [open a GitHub issue](https://github.com/Chaython/Free-AI/issues).

Maintained by [Chaython](https://github.com/Chaython).
