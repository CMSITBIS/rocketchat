import '@testing-library/jest-dom';
import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen, within } from '@testing-library/react';
import React from 'react';

import type { VoiceCallOutgoingSession } from '../../../../../lib/voip/definitions';
import { VoiceCallOutgoingView } from './OutgoingView';

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

const outgoingSession = {
	type: 'OUTGOING',
	contact: { id: '1000', host: 'test' },
	end: jest.fn(),
} as unknown as VoiceCallOutgoingSession;

it('should properly render outgoing calls', async () => {
	render(<VoiceCallOutgoingView session={outgoingSession} />, {
		legacyRoot: true,
		wrapper: wrapper.build(),
	});

	// Header
	expect(screen.getByText('Calling...')).toBeInTheDocument();
	expect(screen.getByTitle('Device_settings')).toBeInTheDocument();

	// Contact ID
	expect(await screen.findByText('Administrator')).toBeInTheDocument();

	// Footer
	expect(within(screen.getByTestId('vc-popup-footer')).queryAllByRole('button')).toHaveLength(5);

	expect(screen.getByLabelText('Turn_off_microphone')).toBeDisabled();
	expect(screen.getByLabelText('Hold')).toBeDisabled();
	expect(screen.getByLabelText('Open_Dialpad')).toBeDisabled();
	expect(screen.getByLabelText('Transfer_call')).toBeDisabled();

	expect(screen.getByLabelText('End_call')).toBeEnabled();
	screen.getByLabelText('End_call').click();
	expect(outgoingSession.end).toHaveBeenCalled();
});
