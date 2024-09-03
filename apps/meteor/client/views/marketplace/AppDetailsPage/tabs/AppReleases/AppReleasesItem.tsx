import { Accordion, Box } from '@rocket.chat/fuselage';
import type { ReactElement } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTimeAgo } from '../../../../../hooks/useTimeAgo';

type IRelease = {
	version: string;
	createdDate: string;
	detailedChangelog: {
		raw: string;
		rendered: string;
	};
};

type ReleaseItemProps = {
	release: IRelease;
};

const AppReleasesItem = ({ release, ...props }: ReleaseItemProps): ReactElement => {
	const { t } = useTranslation();
	const formatDate = useTimeAgo();

	const title = (
		<Box display='flex' flexDirection='row'>
			<Box is='h4' fontScale='p1b' color='default' mie={24}>
				{release.version}
			</Box>
			<Box is='p' fontScale='p1' color='hint'>
				{formatDate(release.createdDate)}
			</Box>
		</Box>
	);

	return (
		<Accordion.Item title={title} {...props}>
			{release.detailedChangelog?.rendered ? (
				<Box dangerouslySetInnerHTML={{ __html: release.detailedChangelog?.rendered }} color='default' />
			) : (
				<Box color='default'>{t('No_release_information_provided')}</Box>
			)}
		</Accordion.Item>
	);
};

export default AppReleasesItem;
