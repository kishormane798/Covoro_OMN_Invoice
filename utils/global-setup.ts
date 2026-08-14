import { chromium, FullConfig, type Page } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';
import path from 'path';
import { LoginPage } from '../pageObjects/OMN_LoginPage';
import { resolveBaseUrl } from './appConfig';
import {
  clearSiteUnavailableMarker,
  writeSiteUnavailableMarker,
} from './siteUnavailableMarker';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const REPO_ROOT = path.resolve(__dirname, '..');
const STORAGE_STATE_FILE = path.join(REPO_ROOT, 'storageState.json');
const SESSION_STORAGE_FILE = path.join(REPO_ROOT, 'sessionStorage.json');

function deleteAuthSnapshots(): void {
  for (const file of [STORAGE_STATE_FILE, SESSION_STORAGE_FILE]) {
    if (existsSync(file)) {
      unlinkSync(file);
    }
  }
}

async function captureSessionStorage(page: Page): Promise<Record<string, string>> {
  // App auth is Redux persist in sessionStorage (`persist:root`), not cookies.
  // CI is slower than local: dashboard URL can land before persist flushes.
  await page.waitForFunction(
    () => {
      try {
        return window.sessionStorage.getItem('persist:root') != null;
      } catch {
        return false;
      }
    },
    undefined,
    { timeout: 30_000 }
  );
  return page.evaluate(() => {
    const store: Record<string, string> = {};
    try {
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (!key) continue;
        store[key] = window.sessionStorage.getItem(key) ?? '';
      }
    } catch {
      /* opaque origin */
    }
    return store;
  });
}

async function globalSetup(config: FullConfig) {
  const configuredBaseUrl = config.projects[0]?.use?.baseURL;
  const baseUrl = resolveBaseUrl(
    process.env.BASE_URL?.trim() ||
      (typeof configuredBaseUrl === 'string' ? configuredBaseUrl : undefined)
  );
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  clearSiteUnavailableMarker();

  if (!email || !password) {
    throw new Error(
      'Missing TEST_USER_EMAIL or TEST_USER_PASSWORD. Add them to `.env`.'
    );
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const loginPage = new LoginPage(page);
    try {
      await loginPage.loginAtBaseUrl(baseUrl, email, password);
    } catch (error) {
      deleteAuthSnapshots();
      const message = error instanceof Error ? error.message : String(error);
      writeSiteUnavailableMarker(baseUrl, message);
      return;
    }

    const sessionData = await captureSessionStorage(page);
    if (!sessionData['persist:root']) {
      deleteAuthSnapshots();
      throw new Error(
        'Login reached dashboard but sessionStorage persist:root was empty. Tests cannot reuse the SPA session (CI field validation would run logged out).'
      );
    }

    const storageState = await page.context().storageState();
    // Playwright storageState is cookies + origins only. Extra keys are ignored
    // (or rejected) when creating contexts — persist sessionStorage separately.
    writeFileSync(STORAGE_STATE_FILE, JSON.stringify(storageState, null, 2));
    writeFileSync(SESSION_STORAGE_FILE, JSON.stringify(sessionData, null, 2));
    console.log(
      `[global-setup] saved sessionStorage (${Object.keys(sessionData).join(', ')}) for origin ${baseUrl}`
    );
  } finally {
    await browser.close();
  }
}
export default globalSetup;
