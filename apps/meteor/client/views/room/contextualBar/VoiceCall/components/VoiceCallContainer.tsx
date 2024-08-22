import { Palette } from '@rocket.chat/fuselage';
import styled from '@rocket.chat/styled';
import type { ReactNode } from 'react';
import React from 'react';
import { FocusScope } from 'react-aria';

type ContainerProps = {
	children: ReactNode;
	secondary?: boolean;
	['data-testid']: string;
};

const Container = styled('article', ({ secondary: _secondary, ...props }: { secondary: boolean }) => props)`
	position: fixed;
	bottom: 132px;
	right: 24px;
	display: flex;
	flex-direction: column;
	max-width: 250px;
	min-height: 128px;
	border-radius: 4px;
	border: 1px solid ${Palette.stroke['stroke-dark'].toString()};
	box-shadow: 0px 0px 1px 0px ${Palette.shadow['shadow-elevation-2x'].toString()},
		0px 0px 12px 0px ${Palette.shadow['shadow-elevation-2y'].toString()};
	background-color: ${(p) => (p.secondary ? Palette.surface['surface-neutral'].toString() : Palette.surface['surface-light'].toString())};
	z-index: 100;
`;

export const VoiceCallContainer = ({ children, secondary = false, ...props }: ContainerProps) => {
	return (
		<FocusScope autoFocus contain restoreFocus>
			<Container role='dialog' aria-labelledby='voiceCallPopupTitle' secondary={secondary} {...props}>
				{children}
			</Container>
		</FocusScope>
	);
};

export default VoiceCallContainer;
