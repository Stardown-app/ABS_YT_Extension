# A Better Subscription System

A Manifest V3 browser extension for following **YouTube playlists** instead of whole channels.

YouTube’s built-in subscriptions are channel-scoped. This project tracks specific playlists, syncs new videos in the background, and lets you mark items watched without drowning in everything a creator uploads.

## Features

- Subscribe to individual YouTube playlist URLs
- Background checks for new, updated, or removed playlist items
- Desktop notifications when new content appears
- Mark videos watched / unwatched (including bulk actions)
- Rename or unsubscribe from playlists
- Account metrics and password update
- Configurable API base URL for the hosted service or a self-hosted backend

## How it fits together

This extension is a client. Account auth, playlist fetch, and subscription sync go through the companion **ABS REST API**.

| Piece | Role |
| --- | --- |
| This extension | UI, local state, alarms, notifications |
| [ABS REST API](https://github.com/Node-JC/ABS-REST-API) | Auth, YouTube playlist ingestion, sync |

Default API host: `https://abs-yt.chua.codes`  
Self-hosters can change that under **API server settings** (login screen or Account Options).

## Requirements

- Chromium-based browser (Chrome or Edge recommended)
- Node.js + npm (to install UI dependencies)
- Access to an ABS REST API instance (hosted default, or your own)

## Install (unpacked)

1. Clone this repository and install dependencies:

```bash
git clone https://github.com/Stardown-app/ABS_YT_Extension.git
cd ABS_YT_Extension
npm install
```

2. Load the extension:

**Chrome**
- Open `chrome://extensions/`
- Enable **Developer mode**
- Choose **Load unpacked**
- Select this project folder (the one that contains `manifest.json`)

**Edge**
- Open `edge://extensions/`
- Enable **Developer mode**
- Choose **Load unpacked**
- Select this project folder

3. Open the extension popup, register or sign in, then subscribe to a playlist URL such as:

```text
https://www.youtube.com/playlist?list=...
```

After code changes, use **Reload** on the extension card in `chrome://extensions/`.

## Configuration

### API server URL

On first run the extension talks to `https://abs-yt.chua.codes`.

To use another deployment:

1. Open **API server settings** from the login screen, or **Account Options → API server**
2. Enter your API base URL (include `http://` or `https://`, no trailing slash required)
3. Save — Chrome may prompt for host permission if the origin differs from the default

Click the navbar logo anytime to trigger a manual subscription check.

## Project layout

```text
manifest.json     Extension manifest (Manifest V3)
popup.html        Main playlist view
login.html        Sign in / register
account.html      Account options and API settings
playlists.html    Subscribe / manage playlists and contents
src/              Background service worker and page scripts
css/              Page styles
assets/           Icons and images
```

## Development

```bash
npm install
```

There is no bundler step today: load the unpacked folder after `npm install`. Dependencies (`bootstrap`, `axios`, `animate.css`) are loaded from `node_modules/` by the HTML pages.

Useful touchpoints:

- `src/background.js` — alarms, retries, subscription sync, notifications
- `src/config.js` — default and stored API base URL
- `src/popup.js` / `playlists.js` / `account.js` / `login.js` — UI flows

## Privacy (short version)

- Account credentials and playlist state are sent to the configured ABS API
- The extension also keeps account/playlist state in `chrome.storage.local` and `localStorage` for the popup and background worker
- No third-party analytics are bundled in this repository

A fuller data-flow description will live in the architecture docs.

## Related repositories

- Extension (this repo): https://github.com/Stardown-app/ABS_YT_Extension
- REST API: https://github.com/Node-JC/ABS-REST-API

## License

MIT © Jonathan Chua — see [LICENSE](LICENSE).
