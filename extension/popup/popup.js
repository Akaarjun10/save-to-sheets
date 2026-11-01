import { DEFAULT_COLUMNS, getSettings, setSettings } from '../lib/storage.js';
import { saveItem } from '../lib/saver.js';

const $ = (selector) => document.querySelector(selector);
let settings;

async function init() {
  settings = await getSettings();
  $('#theme-toggle').checked = settings.theme === 'dark';
  document.documentElement.dataset.theme = settings.theme || 'light';
  $('#theme-toggle').addEventListener('change', saveTheme);
  $('#open-settings').addEventListener('click', () => chrome.runtime.openOptionsPage());
  renderDestinations();
  renderRecent();
  $('#save').addEventListener('click', saveQuickEntry);
  $('#text').focus();
}

function renderDestinations() {
  const select = $('#destination');
  select.replaceChildren();
  for (const sheet of settings.sheets) {
    const option = document.createElement('option');
    option.value = sheet.id;
    option.textContent = sheet.name;
    option.selected = sheet.id === settings.defaultSheetId;
    select.append(option);
  }
}

async function saveQuickEntry() {
  const button = $('#save');
  const text = $('#text').value.trim();
  if (!text) return showMessage('Add text, a link, or a page URL first.');
  button.disabled = true;
  try {
    const result = await saveItem({ text, note: $('#note').value }, $('#destination').value);
    if (result.duplicate) {
      showMessage('Already saved recently. No second copy was added.');
    } else {
      settings = await getSettings();
      showMessage(`Saved to ${result.sheetName}${result.mode === 'demo' ? ' (demo)' : ''}.`);
      renderRecent();
      $('#text').value = '';
      $('#note').value = '';
    }
  } catch (err) {
    showMessage(err.message || String(err));
  } finally {
    button.disabled = false;
  }
}

async function saveTheme() {
  settings.theme = $('#theme-toggle').checked ? 'dark' : 'light';
  document.documentElement.dataset.theme = settings.theme;
  await setSettings(settings);
}

function renderRecent() {
  const box = $('#recent');
  box.replaceChildren();
  const rows = Object.values(settings.demoRows).flat().slice(-5).reverse();
  for (const row of rows) {
    const el = document.createElement('article');
    el.className = 'preview-row';
    const text = document.createElement('span');
    text.textContent = row[2] || '';
    el.append(text);
    box.append(el);
  }
}

function showMessage(message) { $('#message').textContent = message; }

init();
