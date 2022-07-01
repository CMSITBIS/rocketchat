import { useState, useEffect } from 'react';

import { hasLicense } from '../../app/license/client';
import { BundleFeature } from '../../app/license/server/bundles';

export const useHasLicense = (licenseName: BundleFeature): 'loading' | boolean => {
	const [license, setLicense] = useState<'loading' | boolean>('loading');

	useEffect(() => {
		hasLicense(licenseName).then((enabled) => {
			if (enabled) {
				return setLicense(true);
			}
			setLicense(false);
		});
	}, [licenseName]);

	return license;
};
