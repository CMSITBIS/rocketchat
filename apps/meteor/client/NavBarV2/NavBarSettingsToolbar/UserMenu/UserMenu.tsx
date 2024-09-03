import type { IUser } from '@rocket.chat/core-typings';
import type { ComponentProps } from 'react';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import GenericMenu from '../../../components/GenericMenu/GenericMenu';
import type { GenericMenuItemProps } from '../../../components/GenericMenu/GenericMenuItem';
import { useHandleMenuAction } from '../../../components/GenericMenu/hooks/useHandleMenuAction';
import UserMenuButton from './UserMenuButton';
import { useUserMenu } from './hooks/useUserMenu';

type UserMenuProps = { user: IUser } & Omit<ComponentProps<typeof GenericMenu>, 'sections' | 'items' | 'title'>;

const UserMenu = function UserMenu({ user, ...props }: UserMenuProps) {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	const sections = useUserMenu(user);
	const items = sections.reduce((acc, { items }) => [...acc, ...items], [] as GenericMenuItemProps[]);

	const handleAction = useHandleMenuAction(items, () => setIsOpen(false));

	return (
		<GenericMenu
			{...props}
			is={UserMenuButton}
			placement='bottom-end'
			selectionMode='multiple'
			sections={sections}
			title={t('User_menu')}
			onAction={handleAction}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			aria-label={t('User_menu')}
		/>
	);
};

export default memo(UserMenu);
