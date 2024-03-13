import type { Cloud, Serialized } from '@rocket.chat/core-typings';
import { Settings, WorkspaceCredentials } from '@rocket.chat/models';
import { serverFetch as fetch } from '@rocket.chat/server-fetch';
import { v, compile } from 'suretype';

import { callbacks } from '../../../../lib/callbacks';
import { CloudWorkspaceConnectionError } from '../../../../lib/errors/CloudWorkspaceConnectionError';
import { CloudWorkspaceLicenseError } from '../../../../lib/errors/CloudWorkspaceLicenseError';
import { SystemLogger } from '../../../../server/lib/logger/system';
import { LICENSE_VERSION } from '../license';
import { getWorkspaceAccessToken } from './getWorkspaceAccessToken';

const workspaceLicensePayloadSchema = v.object({
	version: v.number().required(),
	address: v.string().required(),
	license: v.string().required(),
	updatedAt: v.string().format('date-time').required(),
	modules: v.string().required(),
	expireAt: v.string().format('date-time').required(),
});

const assertWorkspaceLicensePayload = compile(workspaceLicensePayloadSchema);

const fetchCloudWorkspaceLicensePayload = async ({ token }: { token: string }): Promise<Serialized<Cloud.WorkspaceLicensePayload>> => {
	const workspaceRegistrationClientUri = await WorkspaceCredentials.getCredentialById('workspace_registration_client_uri');

	if (!workspaceRegistrationClientUri) {
		throw new CloudWorkspaceConnectionError('Failed to connect to Rocket.Chat Cloud: missing workspace registration client uri');
	}

	const response = await fetch(`${workspaceRegistrationClientUri.value}/license`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		params: {
			version: LICENSE_VERSION,
		},
	});

	if (!response.ok) {
		try {
			const { error } = await response.json();
			throw new CloudWorkspaceConnectionError(`Failed to connect to Rocket.Chat Cloud: ${error}`);
		} catch (error) {
			throw new CloudWorkspaceConnectionError(`Failed to connect to Rocket.Chat Cloud: ${response.statusText}`);
		}
	}

	const payload = await response.json();

	assertWorkspaceLicensePayload(payload);

	return payload;
};

export async function getWorkspaceLicense() {
	const currentLicense = await Settings.findOne('Cloud_Workspace_License');
	// it should never happen, since even if the license is not found, it will return an empty settings
	if (!currentLicense?._updatedAt) {
		throw new CloudWorkspaceLicenseError('Failed to retrieve current license');
	}

	try {
		const token = await getWorkspaceAccessToken();
		if (!token) {
			return;
		}

		const payload = await fetchCloudWorkspaceLicensePayload({ token });

		if (currentLicense.value && Date.parse(payload.updatedAt) <= currentLicense._updatedAt.getTime()) {
			return;
		}
		await callbacks.run('workspaceLicenseChanged', payload.license);

		return { updated: true, license: payload.license };
	} catch (err) {
		SystemLogger.error({
			msg: 'Failed to update license from Rocket.Chat Cloud',
			url: '/license',
			err,
		});
	}
}
