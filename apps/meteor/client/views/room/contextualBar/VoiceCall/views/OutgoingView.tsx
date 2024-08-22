import React from 'react';
import { useTranslation } from 'react-i18next';

import type { VoiceCallOutgoingSession } from '../../../../../lib/voip/definitions';
import {
	VoiceCallActions as Actions,
	VoiceCallContactId as CallContactId,
	VoiceCallContainer as Container,
	VoiceCallFooter as Footer,
	VoiceCallHeader as Header,
} from '../components';
import { useVoiceCallContactId } from '../hooks/useVoiceCallContactId';

export const VoiceCallOutgoingView = ({ session }: { session: VoiceCallOutgoingSession }) => {
	const { t } = useTranslation();
	const contactData = useVoiceCallContactId({ session });

	return (
		<Container data-testid='vc-popup-outgoing'>
			<Header>{`${t('Calling')}...`}</Header>

			<CallContactId {...contactData} />

			<Footer>
				<Actions onEndCall={session.end} />
			</Footer>
		</Container>
	);
};

export default VoiceCallOutgoingView;
