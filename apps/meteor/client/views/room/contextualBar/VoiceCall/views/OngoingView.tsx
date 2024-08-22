import React, { useState } from 'react';

import type { VoiceCallOngoingSession } from '../../../../../lib/voip/definitions';
import {
	VoiceCallActions as Actions,
	VoiceCallContactId as CallContactId,
	VoiceCallContainer as Container,
	VoiceCallFooter as Footer,
	VoiceCallHeader as Header,
	VoiceCallStatus as Status,
	VoiceCallDialPad as DialPad,
	VoiceCallTimer as Timer,
} from '../components';
import { useVoiceCallContactId } from '../hooks/useVoiceCallContactId';
import useVoiceCallTransferModal from '../hooks/useVoiceCallTransferModal';

export const VoiceCallOngoingView = ({ session }: { session: VoiceCallOngoingSession }) => {
	const { startTransfer } = useVoiceCallTransferModal({ session });
	const contactData = useVoiceCallContactId({ session, transferEnabled: false });

	const [isDialPadOpen, setDialerOpen] = useState(false);
	const [dtmfValue, setDTMF] = useState('');

	const handleDTMF = (value: string, digit: string) => {
		setDTMF(value);
		if (digit) {
			session.dtmf(digit);
		}
	};

	return (
		<Container secondary data-testid='vc-popup-ongoing'>
			<Header>
				<Timer />
			</Header>

			<Status isMuted={session.isMuted} isHeld={session.isHeld} />

			<CallContactId {...contactData} />

			{isDialPadOpen && <DialPad value={dtmfValue} longPress={false} onChange={handleDTMF} />}

			<Footer>
				<Actions
					isMuted={session.isMuted}
					isHeld={session.isHeld}
					isDTMFActive={isDialPadOpen}
					onMute={session.mute}
					onHold={session.hold}
					onEndCall={session.end}
					onTransfer={startTransfer}
					onDTMF={() => setDialerOpen(!isDialPadOpen)}
				/>
			</Footer>
		</Container>
	);
};

export default VoiceCallOngoingView;
