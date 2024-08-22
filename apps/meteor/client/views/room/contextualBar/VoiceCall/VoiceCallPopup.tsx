import React from 'react';

import {
	isVoiceCallErrorSession,
	isVoiceCallIncomingSession,
	isVoiceCallOngoingSession,
	isVoiceCallOutgoingSession,
} from '../../../../lib/voip/definitions';
import { useVoiceCallDialer } from '../../../../providers/VoiceCallProvider/hooks/useVoiceCallDialer';
import { useVoiceCallSession } from '../../../../providers/VoiceCallProvider/hooks/useVoiceCallSession';
import DialerView from './views/DialerView';
import ErrorView from './views/ErrorView';
import IncomingView from './views/IncomingView';
import OngoingView from './views/OngoingView';
import OutgoingView from './views/OutgoingView';

const VoiceCallPopup = () => {
	const session = useVoiceCallSession();
	const { open: isDialerOpen } = useVoiceCallDialer();

	if (isVoiceCallIncomingSession(session)) {
		return <IncomingView session={session} />;
	}

	if (isVoiceCallOngoingSession(session)) {
		return <OngoingView session={session} />;
	}

	if (isVoiceCallOutgoingSession(session)) {
		return <OutgoingView session={session} />;
	}

	if (isVoiceCallErrorSession(session)) {
		return <ErrorView session={session} />;
	}

	if (isDialerOpen) {
		return <DialerView />;
	}

	return null;
};

export default VoiceCallPopup;
