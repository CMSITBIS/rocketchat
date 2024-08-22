import { Box } from '@rocket.chat/fuselage';
import type { ReactNode } from 'react';
import React from 'react';

export const VoiceCallFooter = ({ children }: { children: ReactNode }) => {
	return (
		<Box is='footer' data-testid='vc-popup-footer' p={12} mbs='auto' bg='surface-light'>
			{children}
		</Box>
	);
};

export default VoiceCallFooter;
