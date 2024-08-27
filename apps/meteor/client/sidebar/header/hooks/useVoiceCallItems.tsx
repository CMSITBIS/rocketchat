import { Box } from '@rocket.chat/fuselage';
import { useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import { useMutation } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { GenericMenuItemProps } from '../../../components/GenericMenu/GenericMenuItem';
import { useVoiceCallAPI } from '../../../providers/VoiceCallProvider/hooks/useVoiceCallAPI';
import { useVoiceCallState } from '../../../providers/VoiceCallProvider/hooks/useVoiceCallState';

const useVoiceCallItems = (): GenericMenuItemProps[] => {
	const { t } = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const { error, isEnabled, isReady, isRegistered } = useVoiceCallState();
	const { register, unregister } = useVoiceCallAPI();

	const toggleVoiceCall = useMutation({
		mutationFn: async () => {
			if (!isRegistered) {
				await register();
				return true;
			}

			await unregister();
			return false;
		},
		onSuccess: (isEnabled: boolean) => {
			dispatchToastMessage({
				type: 'success',
				message: isEnabled ? t('Voice_calling_enabled') : t('Voice_calling_disabled'),
			});
		},
	});

	const tooltip = useMemo(() => {
		if (error) {
			return error.message;
		}

		if (!isReady || toggleVoiceCall.isLoading) {
			return t('Loading');
		}

		return '';
	}, [error, isReady, toggleVoiceCall.isLoading, t]);

	return useMemo(() => {
		if (!isEnabled) {
			return [];
		}

		return [
			{
				id: 'toggle-voice-call',
				icon: isRegistered ? 'phone-disabled' : 'phone',
				disabled: !isReady || toggleVoiceCall.isLoading,
				onClick: () => toggleVoiceCall.mutate(),
				content: (
					<Box is='span' title={tooltip}>
						{isRegistered ? t('Disable_voice_calling') : t('Enable_voice_calling')}
					</Box>
				),
			},
		];
	}, [isEnabled, isRegistered, isReady, tooltip, t, toggleVoiceCall]);
};

export default useVoiceCallItems;
