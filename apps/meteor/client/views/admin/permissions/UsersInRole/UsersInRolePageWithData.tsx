import { useRouteParameter } from '@rocket.chat/ui-contexts';
import React, { ReactElement } from 'react';

import { useRole } from '../hooks/useRole';
import UsersInRolePage from './UsersInRolePage';

const UsersInRolePageWithData = (): ReactElement | null => {
	const _id = useRouteParameter('_id');
	const role = useRole(_id);

	if (!role) {
		return null;
	}

	return <UsersInRolePage role={role} />;
};

export default UsersInRolePageWithData;
