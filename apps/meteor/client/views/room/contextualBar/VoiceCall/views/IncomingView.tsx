import React from 'react';
import { useTranslation } from 'react-i18next';

import type { VoiceCallIncomingSession } from '../../../../../lib/voip/definitions';
import {
	VoiceCallActions as Actions,
	VoiceCallContactId as CallContactId,
	VoiceCallContainer as Container,
	VoiceCallFooter as Footer,
	VoiceCallHeader as Header,
} from '../components';
import { useVoiceCallContactId } from '../hooks/useVoiceCallContactId';

export const VoiceCallIncomingView = ({ session }: { session: VoiceCallIncomingSession }) => {
	const { t } = useTranslation();
	const contactData = useVoiceCallContactId({ session });

	return (
		<Container data-testid='vc-popup-incoming'>
			<Header>{`${session.transferedBy ? t('Incoming_call_transfer') : t('Incoming_call')}...`}</Header>

			<CallContactId {...contactData} />

			<Footer>
				<Actions onAccept={session.accept} onDecline={session.end} />
			</Footer>
		</Container>
	);
};

export default VoiceCallIncomingView;
