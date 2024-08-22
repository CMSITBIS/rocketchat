import { Box, IconButton } from '@rocket.chat/fuselage';
import type { ReactNode } from 'react';
import React from 'react';

import VoiceCallSettingsButton from './VoiceCallSettingsButton';

type VoiceCallHeaderProps = {
	children: ReactNode;
	hideSettings?: boolean;
	onClose?: () => void;
};

export const VoiceCallHeader = ({ children, hideSettings, onClose }: VoiceCallHeaderProps) => {
	return (
		<Box is='header' p={12} pbe={4} display='flex' alignItems='center' justifyContent='space-between'>
			{children && (
				<Box is='h3' id='voiceCallPopupTitle' color='font-titles-labels' fontScale='p2' fontWeight='700'>
					{children}
				</Box>
			)}

			{!hideSettings && (
				<Box mis={8}>
					<VoiceCallSettingsButton mini />
				</Box>
			)}

			{onClose && <IconButton mini mis={8} icon='cross' onClick={onClose} />}
		</Box>
	);
};

export default VoiceCallHeader;
