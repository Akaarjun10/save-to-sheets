# Connecting live Google Sheets (OAuth setup)

Demo mode works with no setup. This guide is only for live mode, where rows go into your real Google Sheet.

## Pinned extension ID (do this first, before the store)
The manifest contains a `key` field, which is the public half of a signing key. Chrome uses it to give the extension a fixed ID, so the ID is the same when you load it unpacked, when you upload new zips, and after the Chrome Web Store publishes it. Google ties your OAuth client to that ID, so you can create the OAuth client now, before submitting to the store.

Pinned extension ID: ojknbfjiohmadbdombbocaddlefeaold

The private half of the key is not in this project. Keep it that way: never put a private key in the bundle or the zip.

## 1. Load the extension once (optional check)
1. Open chrome://extensions, turn on Developer mode, click Load unpacked, and pick the `extension` folder.
2. Confirm the ID on the card is `ojknbfjiohmadbdombbocaddlefeaold`. If it differs, the `key` field was not read; do not continue until it matches.

## 2. Create a Google Cloud project
1. Go to console.cloud.google.com and create a project.
2. APIs and Services, Library: search "Google Sheets API" and click Enable.

## 3. Configure the consent screen (Google Auth Platform)
1. Branding: app name "Save to Google Sheets", your support email.
2. Audience: User type External. While the app is in Testing, add your own Google account as a test user.
3. Data Access: add exactly one scope, `https://www.googleapis.com/auth/spreadsheets`. Do not add any other scope. This is the only scope the extension requests (it is in `oauth2.scopes` in the manifest).

## 4. Create the OAuth client
1. Clients, Create client.
2. Application type: Chrome extension.
3. Item ID: `ojknbfjiohmadbdombbocaddlefeaold` (the pinned ID above).
4. Copy the Client ID (ends with `.apps.googleusercontent.com`). This is a public identifier, not a secret. Do not create or download a client secret; Chrome extensions do not need one.

## 5. Paste it into the extension
1. Open `extension/manifest.json`.
2. Set the empty `oauth2.client_id` value to your Client ID.
3. Save, then reload the extension on chrome://extensions.
4. Open Settings, switch to Live, click Connect Google account, and add your sheet by pasting its full link or ID.

The extension shows "Ready" once the placeholder is gone. If it still shows "Not set up", the placeholder is still in the file.

## Security notes (what the extension does and does not keep)
- Tokens are never stored by the extension. Chrome's identity service issues and caches the Google token; the extension only asks for it and sends it to sheets.googleapis.com.
- Settings and demo rows are in chrome.storage.local. The extension uses no localStorage or sessionStorage.
- The extension loads only its own bundled files. Its content security policy is `script-src 'self'; object-src 'none'; base-uri 'none'`, so no remote scripts, no eval, and no inline script can run.
- The only