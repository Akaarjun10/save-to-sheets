import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const require=createRequire(import.meta.url); const {launch}=require('puppeteer');
const ROOT=dirname(dirname(fileURLToPath(import.meta.url))); const EXT=join(ROOT,'extension'); let browser;
try { browser=await launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']}); const page=await browser.newPage(),errors=[]; page.on('pageerror',(err)=>errors.push(err.message)); await page.goto(`file://${EXT}/popup/popup.html`); assert.equal(await page.title(),'Quick save to Google Sheets'); assert.ok(await page.$('#text')); assert.ok(await page.$('#save')); assert.deepEqual(errors,[]); }
finally { await browser?.close(); }
console.log('Smoke tests passed.');
