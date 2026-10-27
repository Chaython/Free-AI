# Free AI — Chaython

Small userscripts that make free AI chat services less frustrating when their servers are busy.

Some AI services temporarily reject prompts when capacity is limited. These userscripts detect the relevant capacity warning, dismiss it, and retry the last prompt with a bounded backoff. They are intended to help with transient capacity errors—not to bypass subscriptions, access controls, or usage limits.

## Userscripts

| Script | Service | What it does |
|---|---|---|
| [Chaython's Kimi K3 Auto Retry](./Chaython%27s%20Kimi%20K3%20Auto%20Retry) | [Kimi](https://www.kimi.ai/) | Detects Kimi's “Too many people are chatting with Kimi” dialog, dismisses it, and retries the captured prompt. |
| [Chaython's Z.ai Auto Retry](./Chaython%27s%20Z.ai%20Auto%20Retry.user.js) | [Z.ai](https://chat.z.ai/) | Detects a Z.ai capacity/overload warning, dismisses it, and retries the last prompt. |

## Install

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/).
2. Open the script file you want from the list above.
3. Copy its contents into a new userscript in Tampermonkey and save it.
4. Open the matching AI website and send a prompt normally.

## Safety and behavior

- Retries are capped to reduce the chance of repeatedly submitting a prompt.
- The scripts preserve the most recently captured prompt and avoid overwriting a different draft where supported.
- Automatic retries depend on the website's current DOM and may need updates if the service changes its interface.
- These scripts do not provide paid access or guarantee that a request will succeed.
- Review userscript code before installing it, and only install scripts you trust.

## Support

Found a bug or a site UI change? Please [open a GitHub issue](https://github.com/Chaython/Free-AI/issues).

Maintained by [Chaython](https://github.com/Chaython).
