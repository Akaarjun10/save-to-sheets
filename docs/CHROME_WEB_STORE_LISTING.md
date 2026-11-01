# Chrome Web Store listing: Save to Google Sheets

Everything below is ready to paste into the Developer Dashboard. Character counts are checked against the store limits.

## Name (max 75 characters)
Save to Google Sheets

## Short description (max 132 characters)
Save selected text, links and pages to a Google Sheet in one click. Each row gets a timestamp and the source URL.

## Full description (max 16,000 characters)
Save to Google Sheets turns anything you find on the web into a row in a spreadsheet, without copy-pasting.

Highlight a passage, right-click a link, or right-click a page, and the extension appends a row to the Google Sheet you choose. Every row records when you saved it, the page it came from, and the text you kept, so your research, quotes, leads and reading lists stay organized in a sheet you already use.

What it does
- Save selected text: highlight anything on a page, right-click, and choose "Save selection to Google Sheets".
- Save a link: right-click any link to store its address.
- Save a page: right-click the page background to store its title and URL.
- Save from the popup: paste or type a snippet, add an optional note, pick a sheet, and save.
- Timestamp and source on every row: each row has the save time, the page URL, the text, and an optional note.
- Multiple sheets: connect more than one sheet or tab and choose a default.
- Demo mode: try the full flow with no Google account. Rows stay on your device.
- Light and dark themes that follow your browser setting.

How it works
Live mode uses Google's Sheets API with your own Google sign-in. The extension appends rows only to the spreadsheet you connect. Demo mode stores rows locally in your browser.

Privacy
The extension does not run its own servers, does not collect analytics, and does not sell or share your data. See the privacy policy in the listing's Privacy tab. You can disconnect your Google account and remove saved demo rows at any time from the Settings page.

Setup for live mode
Live mode needs a Google Cloud OAuth client ID set up by the publisher. Demo mode works immediately after install.

Support
Questions or bugs: use the support email in the listing.

## Category
Productivity

Alternative if the dashboard asks for a second choice: Developer Tools is not a good fit. Use Productivity.

## Language
English

## Single purpose statement (for the Privacy practices tab)
This extension has one purpose: to save text, links and page details the user chooses into a Google Sheet or local demo list.

## Permission justifications (paste each into the matching field)

activeTab
"Used only when the user clicks the extension icon, presses the keyboard shortcut, or uses a right-click menu item. It reads the selected text, title and URL of the current tab so the saved row can record where the text came from. It does not run on tabs in the background."

contextMenus
"Adds right-click menu items 'Save selection', 'Save link', 'Save image' and 'Save page' to Google Sheets. When the user has more than one sheet, each sheet gets its own entry so the user can pick the destination. These items let the user save content without opening the popup."

commands
"Adds the keyboard shortcut Alt+Shift+S (changeable in Chrome's extension shortcuts page) that saves the text the user has selected on the current page to their default sheet. The shortcut only runs when the user presses it, and it reads the selection from the tab the user is viewing."

identity
"Required to let the user sign in to their own Google account through Chrome's identity service, so the extension can write rows to a spreadsheet the user chooses. Chrome issues and stores the token; the extension never saves or sends it anywhere except to the Sheets API. The extension requests only one Google scope, https://www.googleapis.com/auth/spreadsheets, and only when the user chooses live mode and connects an account. It does not request Drive, profile, email or any other scope."

storage
"Stores the user's settings locally on their device: the list of sheets (each with its own column headers), which sheet is the default, the save mode, demo rows when demo mode is used, and a short list of recent save fingerprints used to skip exact duplicates. Nothing from storage is sent to the developer."

Host permission: https://sheets.googleapis.com/*
"Needed to send the user's rows to the Google Sheets API. This is the only network host the extension contacts, and only in live mode."

Scope justification (OAuth scope https://www.googleapis.com/auth/spreadsheets)
"The extension needs the full spreadsheets scope because users choose any existing spreadsheet and tab to append rows to. A narrower drive.file scope only reaches files the app created or the user opened through a picker, which would break saving to existing sheets. The extension only appends rows (values:append) and reads row 1 to check headers. It never deletes, shares or reads other sheets."

Remote code
"The extension does not load or run remote code. All scripts ship inside the package. The content security policy is script-src 'self' with object-src 'none' and base-uri 'none', so no remote scripts, eval or inline script can run. The extension does not fetch executable content from any server."

Pinned extension ID
"The package includes a public key so the extension ID stays fixed across uploads and matches the OAuth client. No private key is in the package."

## Privacy policy (paste as a hosted page and link it in the listing)

Save to Google Sheets: Privacy Policy
Effective date: [insert date you publish]

What we handle
Save to Google Sheets stores the settings you create (connected sheets with their column headers, default sheet, and save mode) and any demo rows you save. This data is kept in your browser's local extension storage on your device.

When you use live mode, the text, source URL, note and timestamp of each row you save are sent directly from your browser to the Google Sheets API, into the spreadsheet you connected. Your Google sign-in is handled by Google through Chrome's identity service. We do not receive, see or store your Google password, your sheet contents, or your Google access token.

What we do not do
We do not run servers that receive your data. We do not collect analytics, usage statistics, or personal information. We do not sell, rent or share data with third parties, and we do not use data for advertising or for creditworthiness.

Permissions
activeTab: reads the current tab's title, URL and selected text only when you act on it (popup, right-click or keyboard shortcut).
contextMenus: adds the right-click save options, including one per sheet and an image option.
commands: adds the Alt+Shift+S keyboard shortcut to save the selection to your default sheet.
identity: lets you sign in to your Google account for live mode, using Chrome's identity service. The only Google scope requested is spreadsheets, and the token is not stored by the extension.
storage: keeps your settings and demo rows on your device.
Access to sheets.googleapis.com: sends rows to Google Sheets in live mode. This is the only host the extension contacts.

Your choices
You can switch to demo mode, remove sheets, clear demo rows, or uninstall the extension at any time. To remove the extension's access to your Google account, open your Google Account security settings and remove Save to Google Sheets from third-party access. Rows already written to your spreadsheet stay in your spreadsheet; delete them there.

Children
This extension is not directed to children under 13.

Changes
If we change this policy, we will update the effective date above and the listing.

Contact
[insert your support email]

## Screenshots guidance (store requires 1280x800 or 640x400, PNG or JPEG, up to 5)
1. Popup in light mode with text typed, the note field filled and the sheet picker open. Caption: "Save any text to a sheet in one click."
2. Right-click menu on a highlighted passage on a normal article page, showing "Save selection to Google Sheets". Caption: "Right-click any selection to save it."
3. Popup in dark mode after a successful save message. Caption: "Light and dark themes."
4. Settings page showing demo and live mode, and the sheet list with a default badge. Caption: "Connect your own Google Sheet."
5. Google Sheet with saved rows showing Timestamp, Source URL, Text and Note columns. Caption: "Every row has a timestamp and source."

Do not use screenshots of Google's logo or trademarked UI beyond what the product shows. Use real screens from the extension, not mockups. Take them at 1280x800 with no browser chrome.

## Pre-submission checklist
- Replace the OAuth client ID in manifest.json before live use. The manifest pins the extension ID (ojknbfjiohmadbdombbocaddlefeaold) via its key field, so one OAuth client (Item ID = that ID) works for both unpacked and store builds. Do not create a second client unless the store ID differs from the pinned one.
- Fill in the privacy policy date and support email, then host the policy at a public URL.
- Developer Dashboard: pay the one-time registration fee if this is your first submission.
- Upload the zip (manifest.json at its root).
- Answer "Data usage" honestly: data handled is user-provided content (text, URLs) sent to Google Sheets, not sold or used for ads.
