// Settings live in chrome.storage.local.
export const DEFAULT_COLUMNS = Object.freeze(['Timestamp', 'Source URL', 'Text', 'Note']);
export const MAX_COLUMNS = 26;
export const RECENT_KEY_LIMIT = 300;
export const STORAGE_FULL_MESSAGE = 'Storage on this device is full. Clear demo rows or remove a sheet in Settings, then try again.';
export const DEFAULT_SETTINGS = Object.freeze({ mode:'demo', sheets:[{ id:'demo-default', name:'Demo sheet', spreadsheetId:'', tab:'Sheet1', columns:[...DEFAULT_COLUMNS] }], defaultSheetId:'demo-default', demoRows:{}, recentKeys:[] });
export function normalizeColumns(columns) { const list = Array.isArray(columns) ? columns.map((c)=>String(c??'').trim()).filter(Boolean).slice(0,MAX_COLUMNS) : []; return list.length ? list : [...DEFAULT_COLUMNS]; }
export async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  const merged = { ...structuredClone(DEFAULT_SETTINGS), ...(settings||{}) };
  if (!Array.isArray(merged.sheets)) merged.sheets=[];
  merged.sheets=merged.sheets.filter((s)=>s&&s.id).map((s)=>({...s,name:s.name||'My sheet',tab:s.tab||'Sheet1',spreadsheetId:s.spreadsheetId||'',columns:normalizeColumns(s.columns)}));
  if (!merged.demoRows||typeof merged.demoRows!=='object') merged.demoRows={};
  if (!Array.isArray(merged.recentKeys)) merged.recentKeys=[];
  if (!merged.sheets.some((s)=>s.id===merged.defaultSheetId)) merged.defaultSheetId=merged.sheets[0]?.id||null;
  return merged;
}
export async function setSettings(settings) {
  try { await chrome.storage.local.set({ settings }); }
  catch(err) { const message=err?.message||String(err); throw new Error(/quota/i.test(message)?STORAGE_FULL_MESSAGE:`Could not save to this device: ${message}`); }
}
