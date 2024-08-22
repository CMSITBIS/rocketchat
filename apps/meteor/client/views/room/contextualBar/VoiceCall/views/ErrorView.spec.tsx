import '@testing-library/jest-dom';
import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen, within } from '@testing-library/react';
import React from 'react';

import type { VoiceCallErrorSession } from '../../../../../lib/voip/definitions';
import { VoiceCallErrorView } from './ErrorView';

const createErrorSession = ({ status }: { status: number }): VoiceCallErrorSession => ({
	type: 'ERROR',
	contact: { id: '1000', host: 'test' },
	error: { status, reason: '' },
	end: jest.fn(),
});

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

it('should properly render error calls', async () => {
	const errorSession = createErrorSession({ status: -1 });
	render(<VoiceCallErrorView session={errorSession} />, {
		legacyRoot: true,
		wrapper: wrapper.build(),
	});

	// Header
	expect(screen.queryByLabelText('Device_settings')).not.toBeInTheDocument();

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
	expect(errorSession.end).toHaveBeenCalled();
});

it('should properly render unknown error calls', async () => {
	const session = createErrorSession({ status: -1 });
	render(<VoiceCallErrorView session={session} />, {
		legacyRoot: true,
		wrapper: wrapper.build(),
	});

	expect(screen.getByText('Unable_to_complete_call')).toBeInTheDocument();
	screen.getByLabelText('End_call').click();
	expect(session.end).toHaveBeenCalled();
});

it('should properly render error for unavailable calls', async () => {
	const session = createErrorSession({ status: 480 });
	render(<VoiceCallErrorView session={session} />, {
		legacyRoot: true,
		wrapper: wrapper.build(),
	});

	expect(screen.getByText('Temporarily_unavailable')).toBeInTheDocument();
	expect(screen.getByLabelText('End_call')).toBeEnabled();
	screen.getByLabelText('End_call').click();
	expect(session.end).toHaveBeenCalled();
});

it('should properly render error for busy calls', async () => {
	const session = createErrorSession({ status: 486 });
	render(<VoiceCallErrorView session={session} />, {
		legacyRoot: true,
		wrapper: wrapper.build(),
	});

	expect(screen.getByText('Caller_is_busy')).toBeInTheDocument();
	expect(screen.getByLabelText('End_call')).toBeEnabled();
	screen.getByLabelText('End_call').click();
	expect(session.end).toHaveBeenCalled();
});

it('should properly render error for terminated calls', async () => {
	const session = createErrorSession({ status: 487 });
	render(<VoiceCallErrorView session={session} />, {
		legacyRoot: true,
		wrapper: wrapper.build(),
	});

	expect(screen.getByText('Call_terminated')).toBeInTheDocument();
	expect(screen.getByLabelText('End_call')).toBeEnabled();
	screen.getByLabelText('End_call').click();
	expect(session.end).toHaveBeenCalled();
});
