import { test, expect, Page } from '@playwright/test';
import faker from '@faker-js/faker';

import { adminLogin, validUserInserted } from './utils/mocks/userAndPasswordMock';
import { SideNav, Administration, Login } from './pageobjects';

test.describe('[Rocket.Chat Settings based permissions]', () => {
	let page: Page;
	let admin: Administration;
	let sideNav: SideNav;
	let login: Login;

	const newHomeTitle = faker.animal.type();

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage();
		sideNav = new SideNav(page);
		admin = new Administration(page);
		login = new Login(page);
	});

	test.describe('[Give User Permissions]', async () => {
		test.beforeAll(async () => {
			await page.goto('/');
			await login.doLogin(adminLogin);
			await sideNav.sidebarUserMenu.click();
			await sideNav.admin.click();
			await admin.permissionsLink.click();
		});

		test.afterAll(async () => {
			await sideNav.doLogout();
		});

		test('Set permission for user to manage settings', async () => {
			await admin.rolesSettingsFindInput.type('settings');
			await admin.page.locator('table tbody tr:first-child td:nth-child(1) >> text="Change some settings"').waitFor();
			const isOptionChecked = await admin.page.isChecked('table tbody tr:first-child td:nth-child(6) label input');

			if (!isOptionChecked) {
				await admin.page.click('table tbody tr:first-child td:nth-child(6) label');
			}
		});

		test('Set Permission for user to change title page title', async () => {
			await admin.rolesSettingsTab.click();
			await admin.rolesSettingsFindInput.fill('Layout');
			await admin.page.locator('table tbody tr:first-child td:nth-child(1) >> text="Layout"').waitFor();
			const isOptionChecked = await admin.page.isChecked('table tbody tr:first-child td:nth-child(6) label input');
			const changeHomeTitleSelected = await admin.page.isChecked('table tbody tr:nth-child(3) td:nth-child(6) label input');
			if (!isOptionChecked && !changeHomeTitleSelected) {
				await admin.page.click('table tbody tr:first-child td:nth-child(6) label');
				await admin.page.click('table tbody tr:nth-child(3) td:nth-child(6) label');
			}
		});
	});

	test.describe('[Test new user setting permissions]', async () => {
		test.beforeAll(async () => {
			await page.goto('/');
			await login.doLogin(validUserInserted);

			await sideNav.sidebarUserMenu.click();
			await sideNav.admin.click();
			await admin.settingsLink.click();
			await admin.layoutSettingsButton.click();
		});

		test.afterAll(async () => {
			await sideNav.doLogout();
		});

		test('expect new permissions is enabled for user', async () => {
			await admin.homeTitleInput.fill(newHomeTitle);
			await admin.buttonSave.click();
		});
	});

	test.describe('[Verify settings change and cleanup]', async () => {
		test.beforeAll(async () => {
			await page.goto('/');
			await login.doLogin(adminLogin);
			await sideNav.sidebarUserMenu.click();
			await sideNav.admin.click();
			await admin.settingsLink.click();
			await admin.settingsSearch.type('Layout');
			await admin.layoutSettingsButton.click();
		});

		test.afterAll(async () => {
			await sideNav.doLogout();
		});

		test('New settings value visible for admin as well', async () => {
			await admin.page.locator('[data-qa-section="Content"]').click();
			await admin.homeTitleInput.waitFor();
			const text = await admin.homeTitleInput.inputValue();
			await admin.generalHomeTitleReset.click();
			await admin.buttonSave.click();
			expect(text).toEqual(newHomeTitle);
		});

		test('Clear all user permissions', async () => {
			await admin.permissionsLink.click();
			await admin.rolesSettingsFindInput.type('settings');
			await admin.page.locator('table tbody tr:first-child td:nth-child(1) >> text="Change some settings"').waitFor();
			await admin.page.click('table tbody tr:first-child td:nth-child(6) label');

			await admin.rolesSettingsTab.click();
			await admin.rolesSettingsFindInput.fill('Layout');
			await admin.page.locator('table tbody tr:first-child td:nth-child(1) >> text="Layout"').waitFor();
			await admin.page.click('table tbody tr td:nth-child(6) label');
			await admin.page.click('table tbody tr:nth-child(3) td:nth-child(6) label');
		});
	});
});
