import { NavBarItem } from '@rocket.chat/fuselage';
import { useEffectEvent } from '@rocket.chat/fuselage-hooks';
import { useLayout } from '@rocket.chat/ui-contexts';
import type { HTMLAttributes } from 'react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useVoiceCallDialer } from '../../providers/VoiceCallProvider/hooks/useVoiceCallDialer';
import { useVoiceCallState } from '../../providers/VoiceCallProvider/hooks/useVoiceCallState';

type NavBarItemVoiceCallDialerProps = Omit<HTMLAttributes<HTMLElement>, 'is'> & {
	primary?: boolean;
};

const NavBarItemVoiceCallDialer = (props: NavBarItemVoiceCallDialerProps) => {
	const { t } = useTranslation();
	const { sidebar } = useLayout();
	const { isEnabled, isReady, isRegistered } = useVoiceCallState();
	const { open: isDialerOpen, openDialer, closeDialer } = useVoiceCallDialer();

	const handleToggleDialer = useEffectEvent(() => {
		sidebar.toggle();
		isDialerOpen ? closeDialer() : openDialer();
	});

	const title = useMemo(() => {
		if (!isReady) {
			return t('Loading');
		}

		if (!isRegistered) {
			return t('Voice_calling_disabled');
		}

		return t('New_Call');
	}, [isReady, isRegistered, t]);

	return isEnabled ? (
		<NavBarItem
			{...props}
			title={title}
			icon='phone'
			onClick={handleToggleDialer}
			pressed={isDialerOpen}
			disabled={!isReady || !isRegistered}
		/>
	) : null;
};

export default NavBarItemVoiceCallDialer;
