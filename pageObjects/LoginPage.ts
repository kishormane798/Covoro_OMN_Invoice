/**
 * Login screen: two-step flow (email + Sign in, then password + Sign in) → `/business-dashboard`.
 * Credentials come from `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` (see `login()` guard).
 */

import { Page } from '@playwright/test';
import { resolveBaseUrl } from '../utils/appConfig';

const SELECTORS = {
    emailInput: 'input[name="email"]',
    passwordInput: 'input[name="password"]',
    signInButton: '#sign-in',
} as const;

export class LoginPage {

    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private emailInput = () =>
        this.page.locator(SELECTORS.emailInput);

    private passwordInput = () =>
        this.page.locator(SELECTORS.passwordInput);

    private signInButton = () =>
        this.page.locator(SELECTORS.signInButton);

    /**
     * Oman login language picker.
     *
     * Important layout quirks (devom):
     * - `.language-selection-modal` wrapper often has height 0 → Playwright "hidden"
     * - Visible dialog is `[data-testid="modalBody"]` (contains #language-en + Continue)
     * - `#language-en` radio can be opacity:0 → use force check/click
     * - Do not `.or()` the zero-height wrapper with modalBody — `.first()` can pick the
     *   hidden wrapper and skip dismiss entirely (global login never reaches password).
     */
    private languageModal = () =>
        this.page
            .locator('[data-testid="modalBody"]')
            .filter({ has: this.page.locator('#language-en') })
            .first();

    private languageContinueButton = () =>
        this.languageModal().getByRole('button', { name: 'Continue' });

    /** First-login language picker — no-op when the modal is not shown. */
    private async dismissLanguageModalIfPresent(): Promise<void> {
        const modal = this.languageModal();
        try {
            await modal.waitFor({ state: 'visible', timeout: 8_000 });
        } catch {
            return;
        }

        const englishRadio = modal.locator('#language-en');
        if (await englishRadio.count()) {
            // Radio is often opacity:0 — force is required.
            await englishRadio.check({ force: true }).catch(async () => {
                await englishRadio.click({ force: true }).catch(() => {});
            });
        }

        const continueButton = this.languageContinueButton();
        try {
            await continueButton.click({ timeout: 8_000 });
        } catch {
            await continueButton.click({ force: true, timeout: 5_000 }).catch(() => {});
        }

        await modal.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    }

    private async clickSignIn(): Promise<void> {
        await this.dismissLanguageModalIfPresent();
        const signIn = this.signInButton();
        try {
            await signIn.click({ timeout: 10_000 });
            return;
        } catch {
            await this.dismissLanguageModalIfPresent();
            try {
                await signIn.click({ timeout: 10_000 });
            } catch {
                await signIn.click({ force: true, timeout: 15_000 });
            }
        }
    }

    private async submitCredentialsAndReachDashboard(
        email: string,
        password: string,
        dashboardTimeoutMs: number,
        passwordVisibleTimeoutMs: number,
    ): Promise<void> {
        await this.dismissLanguageModalIfPresent();
        await this.emailInput().fill(email);
        await this.clickSignIn();
        await this.passwordInput().waitFor({ state: 'visible', timeout: passwordVisibleTimeoutMs });
        await this.dismissLanguageModalIfPresent();
        await this.passwordInput().fill(password);
        await this.clickSignIn();
        await this.dismissLanguageModalIfPresent();
        await this.page.waitForURL('**/business-dashboard', { timeout: dashboardTimeoutMs });
        await this.dismissLanguageModalIfPresent();
    }

    async goto() {
        const loginUrl = `${resolveBaseUrl()}/login`;
        await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
    }

    async login(email: string, password: string) {
        if (!email?.trim() || !password?.trim()) {
            throw new Error('Login credentials missing. Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env');
        }
        await this.submitCredentialsAndReachDashboard(email, password, 15_000, 15_000);
    }

    async loginAtBaseUrl(baseUrl: string, email: string, password: string) {
        if (!email?.trim() || !password?.trim()) {
            throw new Error('Login credentials missing. Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env');
        }
        const root = baseUrl.trim().replace(/\/+$/, '');
        await this.page.goto(`${root}/login`, { timeout: 30_000 });
        await this.submitCredentialsAndReachDashboard(email, password, 60_000, 30_000);
    }

    /**
     * Two-step email/password submit without waiting for dashboard.
     * Use for auth-failure / security checks where success is not expected.
     */
    async submitCredentials(email: string, password: string): Promise<void> {
        await this.dismissLanguageModalIfPresent();
        await this.emailInput().fill(email);
        await this.clickSignIn();
        await this.passwordInput().waitFor({ state: 'visible', timeout: 15_000 });
        await this.dismissLanguageModalIfPresent();
        await this.passwordInput().fill(password);
        await this.clickSignIn();
        await this.dismissLanguageModalIfPresent();
    }

}
