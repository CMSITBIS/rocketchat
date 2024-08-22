import { useSetModal, useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import { useMutation } from '@tanstack/react-query';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { VoiceCallOngoingSession } from '../../../../../lib/voip/definitions';
import { useVoiceCallAPI } from '../../../../../providers/VoiceCallProvider/hooks/useVoiceCallAPI';
import VoiceCallTransferModal from '../modals/TransferModal';

type UseVoiceCallTransferParams = {
	session: VoiceCallOngoingSession;
};

export const useVoiceCallTransferModal = ({ session }: UseVoiceCallTransferParams) => {
	const { t } = useTranslation();
	const setModal = useSetModal();
	const dispatchToastMessage = useToastMessageDispatch();
	const { transferCall } = useVoiceCallAPI();

	const close = useCallback(() => setModal(null), [setModal]);

	useEffect(() => () => close(), [close]);

	const handleTransfer = useMutation({
		mutationFn: async ({ extension, name }: { extension: string; name: string | undefined }) => {
			await transferCall(extension);
			return name || extension;
		},
		onSuccess: (name: string) => {
			dispatchToastMessage({ type: 'success', message: t('Call_transfered_to_x', { name }) });
			close();
		},
		onError: () => {
			dispatchToastMessage({ type: 'error', message: t('Failed_to_transfer_call') });
			close();
		},
	});

	const startTransfer = useCallback(() => {
		setModal(
			<VoiceCallTransferModal
				extension={session.contact.id}
				isLoading={handleTransfer.isLoading}
				onCancel={() => setModal(null)}
				onConfirm={handleTransfer.mutate}
			/>,
		);
	}, [handleTransfer.isLoading, handleTransfer.mutate, session, setModal]);

	return { startTransfer, cancelTransfer: close };
};

export default useVoiceCallTransferModal;
