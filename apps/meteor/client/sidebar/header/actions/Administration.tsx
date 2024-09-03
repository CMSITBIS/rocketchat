import { Sidebar } from '@rocket.chat/fuselage';
import type { HTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import GenericMenu from '../../../components/GenericMenu/GenericMenu';
import { useAdministrationMenu } from './hooks/useAdministrationMenu';

type AdministrationProps = Omit<HTMLAttributes<HTMLElement>, 'is'>;

const Administration = (props: AdministrationProps) => {
	const { t } = useTranslation();

	const sections = useAdministrationMenu();

	return <GenericMenu sections={sections} title={t('Administration')} is={Sidebar.TopBar.Action} {...props} />;
};

export default Administration;
