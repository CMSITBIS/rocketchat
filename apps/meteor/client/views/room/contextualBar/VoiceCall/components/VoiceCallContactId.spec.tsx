import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import VoiceCallContactId from './VoiceCallContactId';

describe('VoiceCallContactId', () => {
	beforeAll(() => {
		Object.assign(navigator, {
			clipboard: {
				writeText: jest.fn(),
			},
		});
	});

	it('should display avatar and name when username is available', () => {
		render(<VoiceCallContactId name='John Doe' username='john.doe' />, {
			legacyRoot: true,
			wrapper: mockAppRoot().build(),
		});

		expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('title', 'john.doe');
		expect(screen.getByText('John Doe')).toBeInTheDocument();
	});

	it('should display transferedBy information when available', () => {
		render(<VoiceCallContactId name='John Doe' username='john.doe' transferedBy='Jane Doe' />, {
			legacyRoot: true,
			wrapper: mockAppRoot().build(),
		});

		expect(screen.getByText('From: Jane Doe')).toBeInTheDocument();
	});

	it('should display copy button when username isnt available', async () => {
		const phone = faker.phone.number();
		render(<VoiceCallContactId name={phone} />, {
			legacyRoot: true,
			wrapper: mockAppRoot().build(),
		});

		const copyButton = screen.getByRole('button', { name: 'Copy_phone_number' });
		expect(copyButton).toBeInTheDocument();

		copyButton.click();
		await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(phone));
	});
});
