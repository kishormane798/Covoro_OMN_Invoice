import { chromium, FullConfig } from '@playwright/test';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';
import path from 'path';
import { LoginPage } from '../pageObjects/LoginPage';
import { resolveBaseUrl } from './appConfig';
import {
  clearSiteUnavailableMarker,
  writeSiteUnavailableMarker,
} from './siteUnavailableMarker';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const STORAGE_STATE_FILE = 'storageState.json';

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
    await loginPage.loginAtBaseUrl(baseUrl, email, password);
    const sessionData = await page.evaluate(() => {
      const win = window as unknown as { sessionStorage: Storage };
      const store: Record<string, string> = {};
      for (let i = 0; i < win.sessionStorage.length; i++) {
        const key = win.sessionStorage.key(i)!;
        store[key] = win.sessionStorage.getItem(key)!;
      }
      return store;
    });
    const storageState = await page.context().storageState();
    writeFileSync(
      STORAGE_STATE_FILE,
      JSON.stringify({ ...storageState, sessionStorage: sessionData }, null, 2)
    );
  } catch (error) {
    if (existsSync(STORAGE_STATE_FILE)) {
      unlinkSync(STORAGE_STATE_FILE);
    }
    const message = error instanceof Error ? error.message : String(error);
    writeSiteUnavailableMarker(baseUrl, message);
  } finally {
    await browser.close();
  }
}
export default globalSetup;
