import { test } from '../Src/baseTest';
import { expect } from '@playwright/test';
import { LoginPage } from '../pageObjects/LoginPage';
import { resolveBaseUrl } from '../utils/appConfig';
import { clearSiteUnavailableMarker } from '../utils/siteUnavailableMarker';

const EMAIL = process.env.TEST_USER_EMAIL ?? '';
const PASSWORD = process.env.TEST_USER_PASSWORD ?? '';

  test('Login · email and password → business dashboard', async ({ freshPage }) => {
    const loginPage = new LoginPage(freshPage);
    await loginPage.loginAtBaseUrl(resolveBaseUrl(), EMAIL, PASSWORD);
    await expect(freshPage).toHaveURL(/\/business-dashboard/);
    clearSiteUnavailableMarker();
  });
