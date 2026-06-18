# browser-automation

Browser automation project using [Taiko](https://taiko.dev/). No AI dependency, no API token required.

## Stack

- **Runtime**: Node.js >=18
- **Automation library**: `taiko` ^1.4.8
- **Language**: JavaScript (CommonJS, `'use strict'`)

## Project Structure

```
tasks/              # Automation tasks — two formats (see below)
  blu/              # BLU app tasks (login, CRUD, search, navigation)
  tm1/              # TM1 app tasks (SSO login via Okta)
    config.js       # TM1-specific env config (TM1_BASE_URL, OKTA_USER_EMAIL, etc.)
    auth.js         # TM1 SSO login flow (market selection → TM1 login → Okta → MFA)
    login.js        # Entry point — run with: npm run tm1:login
helpers/            # Shared utilities
  auth.js           # BLU Okta SSO login helper
  browser.js        # Browser launch/quit/screenshot helpers
  env.js            # BLU environment config
  selectors.js      # Centralised DOM selectors for all apps (okta, app, tm1, etc.)
index.js            # DSL runner — parses and executes .txt task files
package.json
```

## Two Ways to Write Tasks

### 1. Direct Taiko scripts (`.js`)

Full JavaScript using the Taiko API directly. Use this for complex logic (loops, conditionals, dynamic data).

```js
'use strict';
const { openBrowser, closeBrowser, goto, ... } = require('taiko');

(async () => {
  await openBrowser({ headless: false });
  // ... automation steps
  await closeBrowser();
})().catch(async (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
```

Run: `node tasks/my-task.js`

### 2. DSL task files (`.txt`)

Simple line-by-line commands for straightforward flows. Parsed and executed by `index.js`.

**Supported commands:**

| Command | Example |
|---|---|
| `navigate <url>` | `navigate https://example.com` |
| `type <selector> <text>` | `type [name="q"] "hello world"` |
| `click <text>` | `click Login` |
| `press <key>` | `press Enter` |
| `waitFor <text>` | `waitFor "Success"` |
| `screenshot` | `screenshot` |
| `done` | `done` |

Lines starting with `#` are comments.

Run: `node index.js --task tasks/my-task.txt`

## npm Scripts

```bash
npm run example:search   # runs tasks/example-search.js (direct Taiko script)
npm run example:dsl      # runs tasks/google-search.txt via DSL runner
npm run tm1:login        # TM1 SSO login (market → username → Okta → MFA push)
npm run blu:login        # BLU Okta SSO login
npm run blu:all          # full BLU test suite
```

## Environment Variables

Configured in `.env` (see `.env.example`):

| Variable | Used by | Description |
|---|---|---|
| `OKTA_USER_EMAIL` | TM1 | Email for TM1 login screen (e.g. `nukul.ghosh@ticketmaster.com`) |
| `OKTA_USERNAME` | BLU, TM1 | Okta username (e.g. `nukul.ghosh`) |
| `OKTA_PASSWORD` | BLU, TM1 | Okta password |
| `BLU_BASE_URL` | BLU | BLU app URL |
| `TM1_BASE_URL` | TM1 | TM1 preprod URL |
| `OKTA_MFA_TYPE` | BLU, TM1 | MFA type — `push` for Okta Verify push |
| `MFA_TIMEOUT_MS` | BLU, TM1 | MFA approval timeout (default: 60000) |
| `HEADLESS` | All | Set `true` for headless browser |

## Conventions

- Set `process.env.TAIKO_SKIP_HEADING_UPDATE = 'true'` in direct scripts to suppress terminal title updates.
- Screenshots are saved to `screenshots/` directory.
- Error screenshots are captured automatically on failure in direct scripts.
- Selectors: prefer label/placeholder text for readability; use CSS selectors like `[name="q"]` when text-based selectors are unreliable.
- New task files go in `tasks/`.
- All DOM selectors are centralised in `helpers/selectors.js` — update there, not in task scripts.

## Taiko Selector Gotchas

- `button('Text')` only matches `<button>` and `<input type="submit/button">`. For styled `<a>` or `<div>` elements, use `click(text('Text'))` instead.
- Always `clear()` input fields before `write()` — forms may have pre-filled values that get appended to.
- Okta MFA buttons don't respond to Taiko's text/proximity selectors (`near`, `toRightOf`). Use `evaluate()` with native `document.querySelector()` for reliable clicks on Okta MFA elements.
- For Okta form fields, use CSS attribute selectors: `$('[name="identifier"]')`, `$('[name="credentials.passcode"]')`, `$('[data-type="save"]')`.
