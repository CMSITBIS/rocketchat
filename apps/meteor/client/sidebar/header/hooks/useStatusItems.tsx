import type { ValueOf } from '@rocket.chat/core-typings';
import { UserStatus as UserStatusEnum } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useSetting, useTranslation, useUser } from '@rocket.chat/ui-contexts';
import React from 'react';

import { AccountBox } from '../../../../app/ui-utils/client';
import { userStatus } from '../../../../app/user-status/client';
import { callbacks } from '../../../../lib/callbacks';
import type { GenericMenuItemProps } from '../../../components/GenericMenuItem';
import MarkdownText from '../../../components/MarkdownText';
import { UserStatus } from '../../../components/UserStatus';
import { useStatusDisabledModal } from '../../../views/admin/customUserStatus/hooks/useStatusDisabledModal';
import { useCustomStatusModalHandler } from './useCustomStatusModalHandler';

const isDefaultStatus = (id: string): boolean => (Object.values(UserStatusEnum) as string[]).includes(id);
const isDefaultStatusName = (_name: string, id: string): _name is UserStatusEnum => isDefaultStatus(id);
const translateStatusName = (t: ReturnType<typeof useTranslation>, status: (typeof userStatus.list)['']): string => {
	if (isDefaultStatusName(status.name, status.id)) {
		return t(status.name as TranslationKey);
	}

	return status.name;
};

export const useStatusItems = (): GenericMenuItemProps[] => {
	const t = useTranslation();
	const user = useUser();
	const presenceDisabled = useSetting<boolean>('Presence_broadcast_disabled');

	const setStatus = (status: (typeof userStatus.list)['']): void => {
		AccountBox.setStatus(status.statusType, !isDefaultStatus(status.id) ? status.name : '');
		void callbacks.run('userStatusManuallySet', status);
	};

	const filterInvisibleStatus = !useSetting('Accounts_AllowInvisibleStatusOption')
		? (status: ValueOf<(typeof userStatus)['list']>): boolean => status.name !== 'invisible'
		: (): boolean => true;

	const handleCustomStatus = useCustomStatusModalHandler();

	const handleStatusDisabledModal = useStatusDisabledModal();

	const presenceDisabledItem = {
		id: 'presence-disabled',
		content: (
			<Box fontScale='p2'>
				<Box mbe='x4' wordBreak='break-word' style={{ whiteSpace: 'normal' }}>
					{t('User_status_disabled')}
				</Box>
				<Box is='a' color='info' onClick={handleStatusDisabledModal}>
					{t('Learn_more')}
				</Box>
			</Box>
		),
	};

	const statusItems = Object.values(userStatus.list)
		.filter(filterInvisibleStatus)
		.map((status) => {
			const name = status.localizeName ? translateStatusName(t, status) : status.name;
			const modifier = status.statusType || user?.status;
			return {
				id: status.id,
				status: <UserStatus status={modifier} />,
				content: <MarkdownText content={name} parseEmoji={true} variant='inline' />,
				onClick: () => setStatus(status),
				disabled: presenceDisabled,
			};
		});

	return [
		...(presenceDisabled ? [presenceDisabledItem] : []),
		...statusItems,
		{ id: 'custom-status', icon: 'emoji', content: t('Custom_Status'), onClick: handleCustomStatus, disabled: presenceDisabled },
	];
};
