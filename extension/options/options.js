import { DEFAULT_COLUMNS, getSettings, normalizeColumns, setSettings, STORAGE_FULL_MESSAGE } from '../lib/storage.js';
import { columnLetter, ensureHeaders, getAuthToken, headerKey, isPlaceholderClientId, parseColumns, parseSpreadsheetId, verifySheet } from '../lib/sheets.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let currentSettings;

async function init() {
  currentSettings = await getSettings();
  hydrateForm(currentSettings);
  $('#theme-toggle').checked = currentSettings.theme === 'dark';
  document.documentElement.dataset.theme = currentSettings.theme || 'light';
  $('#mode').addEventListener('change', () => { $('#live-panel').hidden = $('#mode').value !== 'live'; });
  $('#theme-toggle').addEventListener('change', () => {
    document.documentElement.dataset.theme = $('#theme-toggle').checked ? 'dark' : 'light';
  });
  $('#add-sheet').addEventListener('click', addSheet);
  $('#save-button').addEventListener('click', saveForm);
  $('#export-demo').addEventListener('click', exportDemo);
  $('#clear-demo').addEventListener('click', clearDemo);
  $('#connect-google').addEventListener('click', connectGoogle);
  renderDemo();
  $('#live-panel').hidden = $('#mode').value !== 'live';
  renderOauthStatus();
}

function hydrateForm(settings) {
  $('#mode').value = settings.mode;
  const list = $('#sheets-list');
  list.replaceChildren();
  for (const sheet of settings.sheets) addSheetCard(sheet, settings.defaultSheetId);
}

function addSheet() {
  const sheet = { id: `sheet-${crypto.randomUUID()}`, name: 'New sheet', spreadsheetId: '', tab: 'Sheet1', columns: [...DEFAULT_COLUMNS] };
  currentSettings.sheets.push(sheet);
  addSheetCard(sheet, currentSettings.defaultSheetId);
  updateNames();
}

function addSheetCard(sheet, defaultId) {
  const card = $('#sheet-template').content.firstElementChild.cloneNode(true);
  $('.sheet-name-input', card).value = sheet.name;
  $('.sheet-id', card).value = sheet.spreadsheetId || '';
  $('.sheet-tab', card).value = sheet.tab;
  $('.sheet-columns', card).value = sheet.columns.join(', ');
  $('.sheet-default', card).value = sheet.id;
  $('.sheet-default', card).checked = sheet.id === defaultId;
  $('.sheet-name-input', card).addEventListener('input', updateNames);
  $('.remove-sheet', card).addEventListener('click', () => {
    if (!confirm(`Remove "${sheet.name}"? Its local demo rows will be deleted.`)) return;
    card.remove();
    currentSettings.sheets = currentSettings.sheets.filter((s) => s.id !== sheet.id);
    renderDemo();
    updateNames();
  });
  $('#sheets-list').append(card);
  updateNames();
}

function updateNames() {
  $$('.sheet-card').forEach((card) => { $('.sheet-name', card).textContent = $('.sheet-name-input', card).value || 'Untitled sheet'; });
}

async function saveForm() {
  clearMessages();
  try {
    const cards = $$('.sheet-card');
    const sheets = cards.map((card) => {
      const name = $('.sheet-name-input', card).value.trim();
      const tab = $('.sheet-tab', card).value.trim();
      if (!name || !tab) throw new Error('Every sheet needs a name and tab.');
      return {
        id: $('.sheet-default', card).value,
        name,
        spreadsheetId: parseSpreadsheetId($('.sheet-id', card).value),
        tab,
        columns: parseColumns($('.sheet-columns', card).value)
      };
    });
    const chosen = $('.sheet-default:checked');
    const next = {
      ...currentSettings,
      mode: $('#mode').value,
      sheets,
      defaultSheetId: chosen?.value || sheets[0]?.id || null,
      theme: $('#theme-toggle').checked ? 'dark' : 'light',
      demoRows: Object.fromEntries(Object.entries(currentSettings.demoRows).filter(([id]) => sheets.some((s) => s.id === id)))
    };
    await setSettings(next);
    currentSettings = next;
    await refreshSheetStatuses();
    showStatus('Settings saved.');
  } catch (err) {
    showError(err.message === STORAGE_FULL_MESSAGE ? STORAGE_FULL_MESSAGE : err.message || String(err));
  }
}

async function refreshSheetStatuses() {
  for (const sheet of currentSettings.sheets) {
    const card = $$('.sheet-card').find((item) => $('.sheet-default', item).value === sheet.id);
    if (!card) continue;
    const input = $('.sheet-id', card);
    input.setCustomValidity('');
    if (!input.value.trim()) continue;
    const id = parseSpreadsheetId(input.value);
    if (!id) { input.setCustomValidity('Paste a valid Google Sheet URL or spreadsheet ID.'); continue; }
    if (currentSettings.mode !== 'live') continue;
    try {
      const titles = await verifySheet(id, sheet.tab);
      input.title = `Connected. Tabs: ${titles.join(', ')}`;
    } catch (err) {
      input.setCustomValidity(err.message || String(err));
    }
  }
}

async function connectGoogle() {
  clearMessages();
  try {
    if (isPlaceholderClientId()) throw new Error('Add your Google OAuth client ID to extension/manifest.json first.');
    await getAuthToken(true);
    $('#oauth-status').textContent = 'Google account connected.';
  } catch (err) {
    $('#oauth-status').textContent = err.message || String(err);
  }
}

function renderOauthStatus() {
  $('#oauth-status').textContent = isPlaceholderClientId()
    ? 'OAuth is not set up. Follow the setup guide before switching to Live.'
    : 'Google account connection is ready.';
}

function exportDemo() {
  clearMessages();
  const rows = Object.values(currentSettings.demoRows).flat();
  if (!rows.length) return showStatus('No demo rows to export yet.');
  const headers = currentSettings.sheets[0]?.columns || DEFAULT_COLUMNS;
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  downloadText('save-to-sheets-demo.csv', csv, 'text/csv');
}

function csvCell(value) {
  const safe = String(value ?? '').replace(/^[=+@]/, "'");
  return `"${safe.replaceAll('"', '""')}"`;
}

async function clearDemo() {
  if (!confirm('Clear all demo rows on this device?')) return;
  currentSettings.demoRows = {};
  try {
    await setSettings(currentSettings);
    renderDemo();
    showStatus('Demo rows cleared.');
  } catch (err) {
    showError(err.message || String(err));
  }
}

function renderDemo() {
  const preview = $('#demo-preview');
  preview.replaceChildren();
  const rows = Object.entries(currentSettings.demoRows).flatMap(([sheetId, values]) => {
    const sheet = currentSettings.sheets.find((s) => s.id === sheetId);
    return (values || []).map((row) => ({ sheet: sheet?.name || 'Removed sheet', row }));
  }).slice(-10).reverse();
  for (const entry of rows) {
    const item = document.createElement('article');
    item.className = 'preview-row';
    const strong = document.createElement('strong');
    strong.textContent = entry.sheet;
    const text = document.createElement('span');
    text.textContent = entry.row[2] || '';
    item.append(strong, text);
    preview.append(item);
  }
}

function downloadText(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function clearMessages() { $('#global-error').hidden = true; $('#global-status').hidden = true; }
function showError(text) { $('#global-error').textContent = text; $('#global-error').hidden = false; }
function showStatus(text) { $('#global-status').textContent = text; $('#global-status').hidden = false; }

init();
