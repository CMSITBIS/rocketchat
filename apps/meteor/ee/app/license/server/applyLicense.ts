import { License } from '@rocket.chat/license';

const applyLicenseBase =
	(fn: () => Promise<boolean>) =>
	async (license: string, isNewLicense: boolean): Promise<boolean> => {
		const enterpriseLicense = (license ?? '').trim();
		if (!enterpriseLicense) {
			return fn();
		}

		if (enterpriseLicense === License.encryptedLicense) {
			return false;
		}

		try {
			return License.setLicense(enterpriseLicense, isNewLicense);
		} catch {
			return fn();
		}
	};

export const applyLicense = applyLicenseBase(async () => false);

export const applyLicenseOrRemove = applyLicenseBase(async () => {
	await License.remove();
	return false;
});
