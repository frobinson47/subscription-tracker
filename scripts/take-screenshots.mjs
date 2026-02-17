import puppeteer from 'puppeteer';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotsDir = resolve(__dirname, '..', 'screenshots');
mkdirSync(screenshotsDir, { recursive: true });

const BASE = 'http://localhost:3001';

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Go to settings first to trigger DB init
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // Click "Load Demo Data" button
  const demoBtn = await page.evaluateHandle(() => {
    const buttons = [...document.querySelectorAll('button')];
    return buttons.find(b => b.textContent.includes('Load Demo Data'));
  });
  if (demoBtn) {
    await demoBtn.click();
    await new Promise(r => setTimeout(r, 3000));
    console.log('Demo data loaded');
  } else {
    console.log('Could not find Load Demo Data button');
  }

  // Set dark mode
  const themeSelect = await page.$('button[role="combobox"]');
  // Find and click theme selector, set to dark
  await page.evaluate(() => {
    // Force dark mode via localStorage (next-themes uses this)
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Screenshots
  const pages = [
    { path: '/dashboard', name: 'dashboard' },
    { path: '/subscriptions', name: 'subscriptions' },
    { path: '/calendar', name: 'calendar' },
    { path: '/household', name: 'household' },
    { path: '/insights', name: 'insights' },
  ];

  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: resolve(screenshotsDir, `${p.name}.png`), fullPage: false });
    console.log(`Captured ${p.name}`);
  }

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
