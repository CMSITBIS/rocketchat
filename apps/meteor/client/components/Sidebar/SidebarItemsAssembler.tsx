import { Box, Divider } from '@rocket.chat/fuselage';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { memo } from 'react';

import type { SidebarItem } from '../../lib/createSidebarItems';
import SidebarNavigationItem from './SidebarNavigationItem';

type SidebarItemsAssemblerProps = {
	items: SidebarItem[];
	currentPath?: string;
};

const SidebarItemsAssembler: FC<SidebarItemsAssemblerProps> = ({ items, currentPath }) => {
	const t = useTranslation();

	const isTranslationKey = (tag: any): tag is TranslationKey => t.has(tag as Parameters<typeof t>[0]);

	return (
		<>
			{items.map(({ href, pathSection, i18nLabel, name, icon, permissionGranted, pathGroup, tag, divider, externalUrl }) => (
				<Box key={i18nLabel || name}>
					{divider && (
						<Box mi='24px'>
							<Divider />
						</Box>
					)}
					<SidebarNavigationItem
						permissionGranted={permissionGranted}
						pathGroup={pathGroup || ''}
						pathSection={href || pathSection || ''}
						icon={icon}
						label={t((i18nLabel || name) as Parameters<typeof t>[0])}
						currentPath={currentPath}
						tag={isTranslationKey(tag) ? t(tag as Parameters<typeof t>[0]) : undefined}
						externalUrl={externalUrl}
					/>
				</Box>
			))}
		</>
	);
};

export default memo(SidebarItemsAssembler);
