import { css } from '@rocket.chat/css-in-js';
import { Box, Button } from '@rocket.chat/fuselage';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useLongPress } from '../../../../../../voip/modal/DialPad/hooks/useLongPress';

type DialPadButtonProps = {
	digit: string;
	subDigit?: string;
	longPressDigit?: string;
	onClick: (digit: string) => void;
};

const dialPadButtonClass = css`
	width: 52px;
	height: 40px;
	min-width: 52px;
	padding: 4px;

	> .rcx-button--content {
		display: flex;
		flex-direction: column;
	}
`;

export const VoiceCallDialPadButton = ({ digit, subDigit, longPressDigit, onClick }: DialPadButtonProps) => {
	const { t } = useTranslation();
	const events = useLongPress(() => longPressDigit && onClick(longPressDigit), {
		onClick: () => onClick(digit),
	});

	return (
		<Button className={dialPadButtonClass} {...events} data-testid={`dial-pad-button-${digit}`}>
			<Box is='span' fontSize={16} lineHeight={16}>
				{digit}
			</Box>
			<Box
				is='span'
				fontSize={12}
				lineHeight={12}
				mbs={4}
				color='hint'
				aria-hidden={!longPressDigit}
				aria-label={longPressDigit ? `, ${t(`Long_press_to_do_x`, { action: longPressDigit })}` : ''}
			>
				{subDigit}
			</Box>
		</Button>
	);
};

export default VoiceCallDialPadButton;
