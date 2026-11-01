# Save to Google Sheets

Save selected text, links, images, or the current page to a Google Sheet without leaving the page. This Manifest V3 extension is version 1.1.0 and pins the extension ID to `ojknbfjiohmadbdombbocaddlefeaold`.

## Features

- Right-click actions for selected text, links, image URLs, and the current page.
- `Alt+Shift+S` saves selected text to the default destination.
- Popup quick-entry mode creates a form from the chosen sheet's columns, including a Note field by default.
- Multiple destinations with sheet selection in the popup and context-menu submenus.
- Demo mode writes to a local “Demo sheet” without Google sign-in.
- Live mode appends rows through Google Sheets API using Chrome Identity OAuth.
- Duplicate-save suppression, text/note limits, demo-row caps, and clear error messages.

## Install

### Chrome Web Store

After a store listing is published, install from its listing page. This project has not been published, so there is no store URL yet. Check the permissions and publisher before installing.

### Developer-mode unpacked

1. Download and extract the project.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.
4. Confirm the ID is `ojknbfjiohmadbdombbocaddlefeaold`.
5. Demo mode works immediately. Configure OAuth before switching to Live.

## Configure Google OAuth for Live mode

The manifest contains the public key that pins the extension ID. Its OAuth `client_id` is deliberately empty until the owner creates a Google Cloud OAuth client. No private signing key or OAuth client secret belongs in this project.

1. Load the unpacked extension and verify the pinned ID above.
2. In Google Cloud Console, create or select a project and enable **Google Sheets API**.
3. Configure Google Auth Platform consent screen, including the app name and support email. Add your account as a test user if the app remains in Testing.
4. Add the Sheets scope: `https://www.googleapis.com/auth/spreadsheets`.
5. Create an OAuth client with application type **Chrome extension** and Item ID `ojknbfjiohmadbdombbocaddlefeaold`.
6. Copy the Client ID ending in `.apps.googleusercontent.com`.
7. Edit `extension/manifest.json`. Set `oauth2.client_id` to that value, replacing the empty string. Keep JSON quoting and commas valid.
8. Save and reload the extension at `chrome://extensions`.
9. Open Settings, choose Live, connect the Google account, and add the spreadsheet URL or ID and exact tab name.

The signed-in Google account must be able to edit each destination. See `docs/SETUP_OAUTH.md` for additional setup notes and troubleshooting. Verify live access before any store release.

## Sheet destinations

Open Settings from the popup to add or edit destinations. Each has a display name, spreadsheet URL or ID, tab name, and comma-separated headers. The default destination receives shortcut saves and context-menu saves without a destination submenu. When there are multiple destinations, the popup and context menus allow choosing one.

Default columns are `Timestamp, Source URL, Text, Note`. Timestamp is generated automatically. Quick-entry fields follow the configured headers except Timestamp. A `Source URL` field is populated from the active page when available and can be edited. Header names control which input values are written. Spreadsheet URLs and bare IDs are accepted; tab names must match exactly. Empty tabs receive configured headers on their first live write. Values are sent with RAW input mode.

## Demo mode

Demo mode is the default while `oauth2.client_id` is empty. Saves go into `chrome.storage.local` under the selected destination and are visible in Settings. No Google authentication or API call occurs. Demo rows are limited to 500 per destination and stay in the current Chrome profile. Configure a real sheet and OAuth client, then switch to Live when ready.

## Keyboard shortcut

Select text on a webpage and press `Alt+Shift+S`; it saves the selection and source page URL to the default sheet. View or change the shortcut at `chrome://extensions/shortcuts`. Chrome restricts extensions on some built-in pages, so shortcut capture may not be available there.

## Permissions

- `activeTab`: permits active-page access following a user action.
- `contextMenus`: registers right-click save actions.
- `identity`: obtains Google OAuth tokens for Live mode.
- `scripting`: reads selected text when the shortcut is invoked.
- `storage`: stores settings, destination definitions, demo rows, and recent-save fingerprints.
- Host permission `https://sheets.googleapis.com/*`: permits Live-mode API requests. The extension does not request blanket access to all websites.

## Privacy and security

Demo rows and settings remain in this browser profile's extension storage. In Live mode, captured row values are sent over HTTPS to the user's chosen Google spreadsheet through Google Sheets API. There is no project backend, telemetry, or remote script loading. OAuth is mediated by Chrome Identity and uses only the Sheets scope listed above. The extension pages enforce `script-src 'self'; object-src 'none'; base-uri 'none'`, with bundled local scripts/styles and no inline scripts. Writes use RAW values. The manifest key is public and pins the ID; do not add private signing material. Removing the extension or clearing its storage can delete local demo rows, but does not remove rows already written in Google Sheets.

## Project structure

```text
save-to-sheets/
├── README.md
├── extension/
│   ├── manifest.json           # MV3, pinned ID key, CSP, OAuth, shortcut
│   ├── background.js           # service worker, menus, shortcut, messages
│   ├── lib/
│   │   ├── storage.js          # local settings/defaults
│   │   ├── sheets.js           # row shaping, OAuth, Google Sheets API
│   │   └── saver.js            # shared save logic, demo/live path, limits
│   ├── popup/                  # popup markup and quick-entry behavior
│   ├── options/                # destinations, mode, demo rows
│   ├── styles/app.css          # popup and settings styles
│   └── icons/                  # extension icons
├── docs/                       # OAuth setup and store listing notes
├── test/                       # Puppeteer integration suite and dependencies
├── test-results.json           # latest case-by-case results
├── shots/                      # screenshots generated by tests
└── save-to-google-sheets.zip   # project archive
```

## Run tests

From `test/`, install test dependencies with `npm ci`, then run `npm test`. The suite launches headless Chrome against local fixture pages and covers page types, popup and quick-entry flows, sheet routing, demo mode, context-menu and shortcut paths, input/error/duplicate behavior, and screenshots. Puppeteer cannot open Chrome's native context-menu UI or send the OS-level shortcut directly in headless mode, so the suite exercises the corresponding registered-handler save paths and verifies the declared shortcut. Results are written to `test-results.json` and screenshots to `shots/`.
