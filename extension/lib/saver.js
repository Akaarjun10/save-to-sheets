// Saves data from the popup, shortcuts and context menus.
import { getSettings, setSettings, RECENT_KEY_LIMIT } from './storage.js';
import { appendRow, buildRow, headerKey } from './sheets.js';
export const MAX_TEXT_LENGTH = 5000;
const DEMO_ROW_LIMIT = 500;
export async function saveItem(item = {}, sheetId) {
  const settings = await getSettings();
  const sheet = settings.sheets.find((s) => s.id === sheetId) || settings.sheets.find((s) => s.id === settings.defaultSheetId) || settings.sheets[0];
  if (!sheet) throw new Error('No sheet selected. Add one in Settings first.');
  const fields = cleanFields(item.fields, sheet.columns);
  const text = String(item.text || fields[findHeader(sheet.columns, 'text')] || '').trim().slice(0, MAX_TEXT_LENGTH);
  const url = safeUrl(item.url || fields[findHeader(sheet.columns, 'source url')]);
  const note = String(item.note || fields[findHeader(sheet.columns, 'note')] || '').trim().slice(0, 200);
  const hasFieldValue = Object.values(fields).some((v) => String(v).trim());
  if (!text && !hasFieldValue) throw new Error('Nothing to save: the text is empty.');
  const key = await dedupeKey(sheet.id, { text, url, note, fields });
  if (settings.recentKeys.includes(key)) return { ok: true, mode: settings.mode, sheetName: sheet.name, sheetId: sheet.id, duplicate: true };
  const row = buildRow(sheet.columns, { text, url, note, fields });
  if (settings.mode === 'live') {
    if (!sheet.spreadsheetId) throw new Error(`"${sheet.name}" is not connected to a Google Sheet. Add a real sheet in Settings.`);
    await appendRow(sheet, row);
  } else {
    settings.demoRows = { ...settings.demoRows, [sheet.id]: [...(settings.demoRows[sheet.id] || []), row].slice(-DEMO_ROW_LIMIT) };
  }
  settings.recentKeys = [...settings.recentKeys, key].slice(-RECENT_KEY_LIMIT);
  await setSettings(settings);
  return { ok: true, mode: settings.mode, sheetName: sheet.name, sheetId: sheet.id, duplicate: false, rowCount: (settings.demoRows[sheet.id] || []).length };
}
function cleanFields(fields, columns) {
  const out = {};
  if (!fields || typeof fields !== 'object') return out;
  for (const column of columns) {
    if (headerKey(column) === 'timestamp') continue;
    if (Object.prototype.hasOwnProperty.call(fields, column)) out[column] = String(fields[column] ?? '').slice(0, MAX_TEXT_LENGTH);
  }
  return out;
}
function findHeader(columns, wanted) { return columns.find((c) => headerKey(c) === wanted) || ''; }
async function dedupeKey(sheetId, { text, url, note, fields }) {
  const bytes = new TextEncoder().encode(`${sheetId}|${JSON.stringify([text, url, note, fields])}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
export function safeUrl(value) { const s = String(value || ''); return /^https?:\/\//i.test(s) ? s.slice(0, 2000) : ''; }
