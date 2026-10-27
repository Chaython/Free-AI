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

## Other free AI services

These services offer free consumer access or free hosted model endpoints as of October 2026. Free access does **not** mean unlimited access: quotas, models, features, and availability can change by region, account, demand, and provider policy. Check the provider's current plan details before relying on a particular limit.

| Service | Free-tier limitations and quota notes | Official links |
|---|---|---|
| [ChatGPT](https://chatgpt.com/) | Usage caps on some models and tools; uploads, image generation, voice, research, memory, and other advanced features have separate or lower limits. The available model and limits can change. | [Free plan](https://chatgpt.com/plans/free/) · [Free-tier FAQ](https://help.openai.com/en/articles/9275245-using-chatgpt-s-free-tier-faq) |
| [Claude](https://claude.ai/chat/) | Limited usage; the amount available depends on conversation length, model, attachments, and tool use. You may have to wait for the reset time shown in Claude. | [Plans](https://claude.com/pricing) · [Usage and length limits](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work) |
| [Google Gemini](https://gemini.google.com/) | Compute-based limits depend on model, prompt complexity, conversation length, and features. Some tools may be unavailable or more restricted on free accounts, and limits can change during high demand. | [Usage limits and feature availability](https://support.google.com/gemini/answer/16275805) |
| [Microsoft Copilot](https://copilot.microsoft.com/) | Free chat and web-grounded answers are available, but feature availability and capacity vary by region, account, and product. Image generation, voice, and longer conversations may have their own limits. | [Copilot free overview](https://support.microsoft.com/en-us/microsoft-365-copilot/what-s-the-difference-between-microsoft-copilot-free-and-copilot-in-microsoft-365) |
| [Perplexity](https://www.perplexity.ai/) | Basic searches are broadly available; Pro searches, file uploads, advanced models, and premium features are limited or excluded on the free Standard plan. | [Plan comparison](https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you) |
| [DeepSeek Chat](https://chat.deepseek.com/) | Free web/app chat is available, but practical availability, speed, model selection, and access during peak demand can vary. This is separate from API access and NVIDIA-hosted endpoints. | [DeepSeek](https://www.deepseek.com/) |
| [Google AI Studio / Gemini API](https://aistudio.google.com/) | API access for eligible models has a free tier with project- and model-specific requests/tokens per minute and requests per day. Exact quotas depend on the model and account; check the dashboard. **Free-tier prompts may be used to improve Google's products**, so avoid sending sensitive data. | [Official rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) · [Pricing and data use](https://ai.google.dev/gemini-api/docs/pricing) |
| [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) | The free allocation is **10,000 Neurons per day**, resetting at 00:00 UTC. This is compute-based rather than a fixed prompt count; some larger/newer models require a paid plan. | [Pricing and daily allowance](https://developers.cloudflare.com/workers-ai/platform/pricing/) · [Model catalog](https://developers.cloudflare.com/workers-ai/models/) |
| [Cohere API](https://dashboard.cohere.com/) | Free trial/evaluation API key. Chat endpoints are generally limited to **20 requests/minute**; trial keys have a **1,000 API-call monthly limit** for other covered endpoints. Limits vary by endpoint/model; intended for evaluation, not unrestricted production use. | [Official rate limits](https://docs.cohere.com/docs/rate-limits) · [Trial key FAQ](https://docs.cohere.com/docs/cohere-faqs) |
| [Mistral La Plateforme API](https://console.mistral.ai/) | Offers an Experiment/free tier for testing selected models, subject to identity verification and account-specific rate limits. Check current terms for data-use and commercial-use restrictions before relying on it. | [Pricing](https://mistral.ai/pricing/) · [API documentation](https://docs.mistral.ai/) |
| [SiliconFlow](https://cloud.siliconflow.com/) | Selected models may have free quotas or account-specific promotions that vary by model, region, and signup offer. Verify the current allowance in the console; not every model is permanently free. | [SiliconFlow console](https://cloud.siliconflow.com/) · [Documentation](https://docs.siliconflow.com/) |
| [LLM7.io](https://llm7.io/) | Offers a free hosted LLM API endpoint with model and capacity restrictions. Public quotas and availability can change; verify current limits and acceptable-use terms. | [LLM7.io](https://llm7.io/) |
| [OpenCode Zen](https://opencode.ai/zen) | Offers selected free models or promotional endpoints at times, especially for coding workflows. The free lineup can be time-limited, so check the live model list rather than assuming permanent access. | [OpenCode Zen](https://opencode.ai/zen) · [Model list](https://opencode.ai/docs/zen/) |
| [NVIDIA Build — free model endpoints](https://build.nvidia.com/models) | Hosts free, rate-limited API endpoints for selected models from multiple labs. Models marked **Free Endpoint** have included [DeepSeek V4.1 Flash](https://build.nvidia.com/deepseek-ai/deepseek-v4.1-flash), [NVIDIA Nemotron](https://build.nvidia.com/nvidia), [GLM](https://build.nvidia.com/z-ai), [Gemma](https://build.nvidia.com/google), and [gpt-oss](https://build.nvidia.com/openai). The catalog changes, so check each model page for current free-endpoint status. Third-party trackers report ceilings around **40 requests/minute and 10,000 requests/day per account**; these figures are not a guarantee for every model and may vary or be throttled during busy periods. Requires an NVIDIA developer account/API key; free trial endpoints are for testing and evaluation, not production. | [Model catalog](https://build.nvidia.com/models) · [DeepSeek V4.1 Flash](https://build.nvidia.com/deepseek-ai/deepseek-v4.1-flash) · [NVIDIA Nemotron information](https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/llm-info/) |
| [OpenRouter — free model aggregator](https://openrouter.ai/models?max_price=0) | One API provides access to a rotating selection of models tagged `:free`. Official pricing currently lists 25+ free models. Free models are limited to **20 requests/minute and 50 requests/day** for accounts that have purchased less than $10 in credits; the daily ceiling rises to **1,000 requests/day** after at least $10 in lifetime credit purchases. Failed requests count toward the daily cap, and free-model availability can change. | [Free models](https://openrouter.ai/models?max_price=0) · [Pricing and rate limits](https://openrouter.ai/pricing) |
| [GroqCloud](https://groq.com/) | Hosted, very fast inference for selected open models. Free-plan quotas are **per model and organization**, and the first limit reached may be requests/minute, requests/day, tokens/minute, or tokens/day. For example, the official table lists **GPT-OSS 120B at 30 RPM, 1,000 RPD, 8,000 TPM and 200,000 TPD**; other models have different limits. Check the live rate-limit table for the model you choose. | [Available models](https://console.groq.com/docs/models) · [Official rate limits](https://console.groq.com/docs/rate-limits) |
| [Kimi](https://www.kimi.ai/) | Free access and available models/features may be limited. Agent, research, document, and coding features can have separate quotas or credit rules; check the usage display in your account. | [Kimi Help Center](https://www.kimi.ai/help) · [Membership and usage rules](https://www.kimi.ai/help/membership/update-rules) |
| [Z.ai](https://chat.z.ai/) | Model availability and request capacity can vary; busy periods may produce overload messages or require you to retry later. Do not assume that every model or tool is unlimited. | [Z.ai Chat](https://chat.z.ai/) |
| [Mistral Vibe](https://chat.mistral.ai/) | The free plan has limited messages, web searches, and coding sessions. Some capabilities and usage levels require a paid plan. | [Plans and pricing](https://mistral.ai/pricing/) |
| [Grok by xAI](https://grok.com/) | Free chat has usage/message limits, but xAI does not publish a dependable fixed daily message count; available quota and reset timing may vary. Some free accounts may see limited daily video generation in Grok Imagine, but free video access and the number of generations are not guaranteed by the public plan page and can change. Expect busy-server errors, rate limits, or reduced access at peak times. Paid plans advertise higher limits and broader Imagine access. | [Plans and pricing](https://x.ai/pricing) · [Grok help and usage](https://help.x.com/en/using-x/about-grok) |

### Common free-tier trade-offs

- **Message and time-window caps:** A service may stop responding until a quota resets, sometimes with a specific reset time and sometimes without one.
- **Model/API rate limits:** Hosted model APIs can cap requests per minute or day. A free endpoint may have separate limits per model, shared account limits, or temporary throttling.
- **Model restrictions:** The newest, strongest, or reasoning-focused models may have smaller quotas or require a paid plan.
- **Tool restrictions:** File uploads, image and video generation, deep research, web search, coding agents, and other tools may have separate caps.
- **Peak-time throttling:** A service may slow down, temporarily refuse requests, switch models, or show an overload/capacity warning.
- **Context and output limits:** Long conversations, large files, and lengthy responses consume more of the available allowance and may be cut off.
- **Regional and account differences:** Limits can depend on country, age, account status, staged rollouts, or provider policy. Providers can change limits without notice.

The services above are alternatives, not guarantees of unlimited free use. Quota numbers described as third-party reports or account-dependent features should be treated as estimates, not promises. This repository's scripts only automate the specific visible controls described in the **Userscripts** table; they do not currently automate every service listed here.

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
