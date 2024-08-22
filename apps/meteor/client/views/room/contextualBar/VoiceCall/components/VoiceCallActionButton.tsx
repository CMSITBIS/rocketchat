import { Icon, IconButton } from '@rocket.chat/fuselage';
import type { Keys } from '@rocket.chat/icons';
import type { ComponentProps } from 'react';
import React from 'react';

type ActionButtonProps = Pick<ComponentProps<typeof IconButton>, 'className' | 'disabled' | 'pressed' | 'danger' | 'success'> & {
	label: string;
	icon: Keys;
	onClick?: () => void;
};

export const VoiceCallActionButton = ({ disabled, label, icon, danger, success, className, onClick }: ActionButtonProps) => {
	return (
		<IconButton
			medium
			danger={danger}
			success={success}
			secondary={success || danger}
			className={className}
			icon={<Icon name={icon} />}
			title={label}
			aria-label={label}
			disabled={disabled}
			onClick={() => onClick?.()}
		/>
	);
};

export default VoiceCallActionButton;
