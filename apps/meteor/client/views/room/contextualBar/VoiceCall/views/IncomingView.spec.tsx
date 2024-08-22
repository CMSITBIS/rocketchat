import '@testing-library/jest-dom';
import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen, within } from '@testing-library/react';
import React from 'react';

import type { VoiceCallIncomingSession } from '../../../../../lib/voip/definitions';
import { VoiceCallIncomingView } from './IncomingView';

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

const incomingSession = {
	type: 'INCOMING',
	contact: { id: '1000', host: 'test' },
	isMuted: false,
	end: jest.fn(),
	accept: jest.fn(),
	mute: jest.fn(),
} as unknown as VoiceCallIncomingSession;

it('should properly render incoming calls', async () => {
	render(<VoiceCallIncomingView session={incomingSession} />, {
		legacyRoot: true,
		wrapper: wrapper.build(),
	});

	// Header
	expect(screen.getByText('Incoming_call...')).toBeInTheDocument();
	expect(screen.getByTitle('Device_settings')).toBeInTheDocument();

	// Contact ID
	expect(await screen.findByText('Administrator')).toBeInTheDocument();

	// Footer
	expect(within(screen.getByTestId('vc-popup-footer')).queryAllByRole('button')).toHaveLength(5);

	expect(screen.getByLabelText('Decline')).toBeEnabled();
	screen.getByLabelText('Decline').click();
	expect(incomingSession.end).toHaveBeenCalled();

	expect(screen.getByLabelText('Turn_off_microphone')).toBeDisabled();
	expect(screen.getByLabelText('Open_Dialpad')).toBeDisabled();
	expect(screen.getByLabelText('Transfer_call')).toBeDisabled();

	expect(screen.getByLabelText('Accept')).toBeEnabled();
	screen.getByLabelText('Accept').click();
	expect(incomingSession.accept).toHaveBeenCalled();
});
