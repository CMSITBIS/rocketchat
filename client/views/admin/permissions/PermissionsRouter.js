import React from 'react';

import { useRouteParameter } from '../../../contexts/RouterContext';
import UsersInRole from './UsersInRole';
import PermissionsTable from './PermissionsTable';
import { usePermission } from '../../../contexts/AuthorizationContext';
import NotAuthorizedPage from '../../../components/NotAuthorizedPage';

const PermissionsRouter = () => {
	const canViewPermission = usePermission('access-permissions');

	const context = useRouteParameter('context');

	if (!canViewPermission) {
		return <NotAuthorizedPage />;
	}

	if (context === 'users-in-role') {
		return <UsersInRole />;
	}

	return <PermissionsTable />;
};

export default PermissionsRouter;
