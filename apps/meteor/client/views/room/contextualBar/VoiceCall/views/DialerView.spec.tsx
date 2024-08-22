/* eslint-disable testing-library/no-await-sync-events */
import '@testing-library/jest-dom';
import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { VoiceCallDialerView } from './DialerView';

const makeCall = jest.fn();
const closeDialer = jest.fn();

jest.mock('../../../../../providers/VoiceCallProvider/hooks/useVoiceCallAPI', () => ({
	useVoiceCallAPI: jest.fn(() => ({ makeCall, closeDialer })),
}));

it('should look good', async () => {
	render(<VoiceCallDialerView />, { legacyRoot: true, wrapper: mockAppRoot().build() });

	expect(screen.getByText('New_Call')).toBeInTheDocument();
	expect(screen.getByTitle('Device_settings')).toBeEnabled();
	expect(screen.getByRole('button', { name: /Call/i })).toBeDisabled();
});

it('should only enable call button if input has value (keyboard)', async () => {
	render(<VoiceCallDialerView />, { legacyRoot: true, wrapper: mockAppRoot().build() });

	expect(screen.getByRole('button', { name: /Call/i })).toBeDisabled();
	await userEvent.type(screen.getByLabelText('Phone_number'), '123');
	expect(screen.getByRole('button', { name: /Call/i })).toBeEnabled();
});

it('should only enable call button if input has value (mouse)', async () => {
	render(<VoiceCallDialerView />, { legacyRoot: true, wrapper: mockAppRoot().build() });

	expect(screen.getByRole('button', { name: /Call/i })).toBeDisabled();
	screen.getByTestId(`dial-pad-button-1`).click();
	screen.getByTestId(`dial-pad-button-2`).click();
	screen.getByTestId(`dial-pad-button-3`).click();
	expect(screen.getByRole('button', { name: /Call/i })).toBeEnabled();
});

it('should call methods makeCall and closeDialer when call button is clicked', async () => {
	render(<VoiceCallDialerView />, { legacyRoot: true, wrapper: mockAppRoot().build() });

	await userEvent.type(screen.getByLabelText('Phone_number'), '123');
	screen.getByTestId(`dial-pad-button-1`).click();
	screen.getByRole('button', { name: /Call/i }).click();
	expect(makeCall).toHaveBeenCalledWith('1231');
	expect(closeDialer).toHaveBeenCalled();
});
