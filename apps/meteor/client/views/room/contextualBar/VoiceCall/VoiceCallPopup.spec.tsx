import '@testing-library/jest-dom';
import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen } from '@testing-library/react';
import React from 'react';

import type { VoiceCallSession } from '../../../../lib/voip/definitions';
import { useVoiceCallSession } from '../../../../providers/VoiceCallProvider/hooks/useVoiceCallSession';
import VoiceCallPopup from './VoiceCallPopup';

jest.mock('../../../../providers/VoiceCallProvider/hooks/useVoiceCallSession', () => ({
	useVoiceCallSession: jest.fn(),
}));

jest.mock('../../../../providers/VoiceCallProvider/hooks/useVoiceCallDialer', () => ({
	useVoiceCallDialer: jest.fn(() => ({ open: true, openDialer: () => undefined, closeDialer: () => undefined })),
}));

const mockedUseVoiceCallSession = jest.mocked(useVoiceCallSession);

const createVoiceCallSession = (partial: Partial<VoiceCallSession>): VoiceCallSession => ({
	type: 'INCOMING',
	contact: { name: 'test', id: '1000', host: '' },
	transferedBy: null,
	isMuted: false,
	isHeld: false,
	error: { status: -1, reason: '' },
	accept: jest.fn(),
	end: jest.fn(),
	mute: jest.fn(),
	hold: jest.fn(),
	dtmf: jest.fn(),
	...partial,
});

it('should properly render incoming popup', async () => {
	mockedUseVoiceCallSession.mockImplementationOnce(() => createVoiceCallSession({ type: 'INCOMING' }));
	render(<VoiceCallPopup />, { legacyRoot: true, wrapper: mockAppRoot().build() });

	expect(screen.getByTestId('vc-popup-incoming')).toBeInTheDocument();
});

it('should properly render ongoing popup', async () => {
	mockedUseVoiceCallSession.mockImplementationOnce(() => createVoiceCallSession({ type: 'ONGOING' }));

	render(<VoiceCallPopup />, { legacyRoot: true, wrapper: mockAppRoot().build() });

	expect(screen.getByTestId('vc-popup-ongoing')).toBeInTheDocument();
});

it('should properly render outgoing popup', async () => {
	mockedUseVoiceCallSession.mockImplementationOnce(() => createVoiceCallSession({ type: 'OUTGOING' }));

	render(<VoiceCallPopup />, { legacyRoot: true, wrapper: mockAppRoot().build() });

	expect(screen.getByTestId('vc-popup-outgoing')).toBeInTheDocument();
});

it('should properly render error popup', async () => {
	mockedUseVoiceCallSession.mockImplementationOnce(() => createVoiceCallSession({ type: 'ERROR' }));

	render(<VoiceCallPopup />, { legacyRoot: true, wrapper: mockAppRoot().build() });

	expect(screen.getByTestId('vc-popup-error')).toBeInTheDocument();
});

it('should properly render dialer popup', async () => {
	render(<VoiceCallPopup />, { legacyRoot: true, wrapper: mockAppRoot().build() });

	expect(screen.getByTestId('vc-popup-dialer')).toBeInTheDocument();
});

it('should prioritize session over dialer', async () => {
	mockedUseVoiceCallSession.mockImplementationOnce(() => createVoiceCallSession({ type: 'INCOMING' }));

	render(<VoiceCallPopup />, { legacyRoot: true, wrapper: mockAppRoot().build() });

	expect(screen.queryByTestId('vc-popup-dialer')).not.toBeInTheDocument();
	expect(screen.getByTestId('vc-popup-incoming')).toBeInTheDocument();
});
