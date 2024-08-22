import { Button, ButtonGroup } from '@rocket.chat/fuselage';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useVoiceCallAPI } from '../../../../../providers/VoiceCallProvider/hooks/useVoiceCallAPI';
import {
	VoiceCallContainer as Container,
	VoiceCallFooter as Footer,
	VoiceCallHeader as Header,
	VoiceCallDialPad as DialPad,
	VoiceCallSettingsButton as SettingsButton,
} from '../components';

export const VoiceCallDialerView = () => {
	const { t } = useTranslation();
	const { makeCall, closeDialer } = useVoiceCallAPI();
	const [number, setNumber] = useState('');

	const handleCall = () => {
		makeCall(number);
		closeDialer();
	};

	return (
		<Container secondary data-testid='vc-popup-dialer'>
			<Header hideSettings onClose={closeDialer}>
				{t('New_Call')}
			</Header>

			<DialPad editable value={number} onChange={(value) => setNumber(value)} />

			<Footer>
				<ButtonGroup large>
					<SettingsButton />
					<Button medium success icon='phone' disabled={!number} flexGrow={1} onClick={handleCall}>
						{t('Call')}
					</Button>
				</ButtonGroup>
			</Footer>
		</Container>
	);
};

export default VoiceCallDialerView;
