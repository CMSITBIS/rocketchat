import { ILivechatAgentStatus } from '@rocket.chat/core-typings';
import { Users } from '@rocket.chat/models';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';
import { Livechat } from '../lib/LivechatTyped';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:changeLivechatStatus'(params?: { status?: string; agentId?: string }): unknown;
	}
}

const toStatus = (status?: string): ILivechatAgentStatus | undefined => {
	switch (status) {
		case 'available':
			return ILivechatAgentStatus.AVAILABLE;
		case 'not-available':
			return ILivechatAgentStatus.NOT_AVAILABLE;
		default:
			return undefined;
	}
};

Meteor.methods<ServerMethods>({
	async 'livechat:changeLivechatStatus'({ status, agentId = Meteor.userId() } = {}) {
		methodDeprecationLogger.method('livechat:changeLivechatStatus', '7.0.0');

		const uid = Meteor.userId();

		if (!uid || !agentId) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'livechat:changeLivechatStatus',
			});
		}

		const agent = await Users.findOneAgentById(agentId, {
			projection: {
				status: 1,
				statusLivechat: 1,
			},
		});

		if (!agent) {
			throw new Meteor.Error('error-not-allowed', 'Invalid Agent Id', {
				method: 'livechat:changeLivechatStatus',
			});
		}

		if (status && !['available', 'not-available'].includes(status)) {
			throw new Meteor.Error('error-not-allowed', 'Invalid Status', {
				method: 'livechat:changeLivechatStatus',
			});
		}

		const newStatus: ILivechatAgentStatus =
			toStatus(status) || (agent.statusLivechat === 'available' ? ILivechatAgentStatus.NOT_AVAILABLE : ILivechatAgentStatus.AVAILABLE);

		if (newStatus === agent.statusLivechat) {
			return;
		}

		if (agentId !== uid) {
			if (!(await hasPermissionAsync(uid, 'manage-livechat-agents'))) {
				throw new Meteor.Error('error-not-allowed', 'Not allowed', {
					method: 'livechat:changeLivechatStatus',
				});
			}
			return Livechat.setUserStatusLivechat(agentId, newStatus);
		}

		if (!(await Livechat.allowAgentChangeServiceStatus(newStatus, agentId))) {
			throw new Meteor.Error('error-business-hours-are-closed', 'Not allowed', {
				method: 'livechat:changeLivechatStatus',
			});
		}

		return Livechat.setUserStatusLivechat(agentId, newStatus);
	},
});
