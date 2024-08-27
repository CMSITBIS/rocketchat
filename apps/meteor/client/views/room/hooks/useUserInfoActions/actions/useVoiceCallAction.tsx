import type { IUser } from '@rocket.chat/core-typings';
import { useUserId } from '@rocket.chat/ui-contexts';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useVoiceCallAPI } from '../../../../../providers/VoiceCallProvider/hooks/useVoiceCallAPI';
import { useVoiceCallState } from '../../../../../providers/VoiceCallProvider/hooks/useVoiceCallState';
import { useMediaPermissions } from '../../../composer/messageBox/hooks/useMediaPermissions';
import { useUserCard } from '../../../contexts/UserCardContext';
import type { UserInfoAction } from '../useUserInfoActions';

export const useVoiceCallAction = (user: Pick<IUser, '_id' | 'username' | 'freeSwitchExtension'>): UserInfoAction | undefined => {
	const { t } = useTranslation();
	const { closeUserCard } = useUserCard();
	const ownUserId = useUserId();

	const { isEnabled, isRegistered, isOngoing } = useVoiceCallState();
	const { makeCall } = useVoiceCallAPI();
	const [isMicPermissionDenied] = useMediaPermissions('microphone');

	const isRemoteRegistered = !!user?.freeSwitchExtension;
	const isSameUser = ownUserId === user._id;

	const disabled = isSameUser || isMicPermissionDenied || !isRemoteRegistered || !isRegistered || isOngoing;

	const voiceCallOption = useMemo<UserInfoAction | undefined>(() => {
		const handleClick = () => {
			makeCall(user?.freeSwitchExtension as string);
			closeUserCard();
		};

		return isEnabled && !isSameUser
			? {
					type: 'communication',
					content: t('Voice_call'),
					icon: 'phone',
					disabled,
					iconOnly: true,
					onClick: handleClick,
			  }
			: undefined;
	}, [closeUserCard, disabled, isEnabled, isSameUser, makeCall, t, user?.freeSwitchExtension]);

	return voiceCallOption;
};
