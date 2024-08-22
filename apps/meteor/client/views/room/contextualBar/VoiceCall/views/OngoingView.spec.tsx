import '@testing-library/jest-dom';
import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen, within } from '@testing-library/react';
import React from 'react';

import type { VoiceCallOngoingSession } from '../../../../../lib/voip/definitions';
import { VoiceCallOngoingView } from './OngoingView';

const wrapper = mockAppRoot().withEndpoint('GET', '/v1/voip-freeswitch.extension.getDetails', () => ({
	extension: '1000',
	context: 'default',
	domain: '',
	groups: ['default'],
	status: 'REGISTERED' as const,
	contact: '',
	callGroup: 'techsupport',
	callerName: 'Extension 1000',
	callerNumber: '1000',
	userId: '',
	name: 'Administrator',
	username: 'administrator',
	success: true,
}));

const ongoingSession = {
	type: 'ONGOING',
	contact: { id: '1000', host: 'test' },
	isMuted: false,
	end: jest.fn(),
	mute: jest.fn(),
	hold: jest.fn(),
	dtmf: jest.fn(),
} as unknown as VoiceCallOngoingSession;

it('should properly render ongoing calls', async () => {
	render(<VoiceCallOngoingView session={ongoingSession} />, {
		legacyRoot: true,
		wrapper: wrapper.build(),
	});

	// Header
	expect(screen.getByText('00:00')).toBeInTheDocument();
	expect(screen.getByTitle('Device_settings')).toBeInTheDocument();

	// Contact ID
	expect(await screen.findByText('Administrator')).toBeInTheDocument();

	// Footer
	expect(within(screen.getByTestId('vc-popup-footer')).queryAllByRole('button')).toHaveLength(5);

	expect(screen.getByLabelText('Turn_off_microphone')).toBeEnabled();
	screen.getByLabelText('Turn_off_microphone').click();
	expect(ongoingSession.mute).toHaveBeenCalled();

	expect(screen.getByLabelText('Hold')).toBeEnabled();
	screen.getByLabelText('Hold').click();
	expect(ongoingSession.hold).toHaveBeenCalled();

	expect(screen.getByLabelText('Open_Dialpad')).toBeEnabled();
	screen.getByLabelText('Open_Dialpad').click();
	screen.getByTestId('dial-pad-button-1').click();
	expect(screen.getByLabelText('Phone_number')).toHaveValue('1');
	expect(ongoingSession.dtmf).toHaveBeenCalledWith('1');

	expect(screen.getByLabelText('Transfer_call')).toBeEnabled();

	expect(screen.getByLabelText('End_call')).toBeEnabled();
	screen.getByLabelText('End_call').click();
	expect(ongoingSession.end).toHaveBeenCalled();
});
