import type { IUser, SelectedAgent } from '@rocket.chat/core-typings';
import { LivechatVisitors, LivechatInquiry, LivechatRooms, Users } from '@rocket.chat/models';

import { notifyOnLivechatInquiryChanged } from '../../../../../app/lib/server/lib/notifyListener';
import { RoutingManager } from '../../../../../app/livechat/server/lib/RoutingManager';
import { settings } from '../../../../../app/settings/server';
import { callbacks } from '../../../../../lib/callbacks';

let contactManagerPreferred = false;
let lastChattedAgentPreferred = false;

const normalizeDefaultAgent = (agent?: Pick<IUser, '_id' | 'username'> | null): SelectedAgent | null => {
	if (!agent) {
		return null;
	}

	return { agentId: agent._id, username: agent.username };
};

const getDefaultAgent = async (username?: string): Promise<SelectedAgent | null> => {
	if (!username) {
		return null;
	}

	return normalizeDefaultAgent(await Users.findOneOnlineAgentByUserList(username, { projection: { _id: 1, username: 1 } }));
};

async function findGuest(guestId: string) {
	return LivechatVisitors.findOneEnabledById(guestId, {
		projection: { lastAgent: 1, token: 1, contactManager: 1 },
	});
}

function findPrioritizedAgent(contactManager?: string, lastAgent?: string) {
	const managerAgent = contactManagerPreferred && getDefaultAgent(contactManager || '');
	return managerAgent || getDefaultAgent(lastAgent || '');
}

async function findLastRoomAgent(token: string) {
	const room = await LivechatRooms.findOneLastServedAndClosedByVisitorToken(token, {
		projection: { servedBy: 1 },
	});
	if (!room?.servedBy?.username) {
		return null;
	}
	return normalizeDefaultAgent(await Users.findOneOnlineAgentByUserList(room.servedBy.username, { projection: { _id: 1, username: 1 } }));
}

settings.watch<boolean>('Livechat_last_chatted_agent_routing', (value) => {
	lastChattedAgentPreferred = value;
	if (!lastChattedAgentPreferred) {
		callbacks.remove('livechat.onMaxNumberSimultaneousChatsReached', 'livechat-on-max-number-simultaneous-chats-reached');
		callbacks.remove('livechat.afterTakeInquiry', 'livechat-save-default-agent-after-take-inquiry');
		return;
	}

	callbacks.add(
		'livechat.afterTakeInquiry',
		async ({ inquiry }, agent) => {
			if (!inquiry || !agent) {
				return inquiry;
			}

			if (!RoutingManager.getConfig()?.autoAssignAgent) {
				return inquiry;
			}

			const { v: { token } = {} } = inquiry;
			if (!token) {
				return inquiry;
			}

			await LivechatVisitors.updateLastAgentByToken(token, { ...agent, ts: new Date() });

			return inquiry;
		},
		callbacks.priority.MEDIUM,
		'livechat-save-default-agent-after-take-inquiry',
	);

	callbacks.add(
		'livechat.onMaxNumberSimultaneousChatsReached',
		async (inquiry) => {
			if (!inquiry?.defaultAgent) {
				return inquiry;
			}

			if (!RoutingManager.getConfig()?.autoAssignAgent) {
				return inquiry;
			}

			await LivechatInquiry.removeDefaultAgentById(inquiry._id);

			void notifyOnLivechatInquiryChanged(inquiry, 'updated', {
				defaultAgent: undefined,
			});

			return LivechatInquiry.findOneById(inquiry._id);
		},
		callbacks.priority.MEDIUM,
		'livechat-on-max-number-simultaneous-chats-reached',
	);
});

settings.watch<boolean>('Omnichannel_contact_manager_routing', (value) => {
	contactManagerPreferred = value;
});

callbacks.add(
	'livechat.checkDefaultAgentOnNewRoom',
	async (defaultAgent, defaultGuest) => {
		if (defaultAgent || !defaultGuest) {
			return defaultAgent;
		}

		const guest = await findGuest(defaultGuest._id);
		if (!guest) {
			return defaultAgent;
		}

		const prioritizedAgent = await findPrioritizedAgent(guest.contactManager?.username, guest.lastAgent?.username);
		if (prioritizedAgent) {
			return prioritizedAgent;
		}

		if (!lastChattedAgentPreferred) {
			return defaultAgent;
		}

		const lastRoomAgent = await findLastRoomAgent(guest.token);
		return lastRoomAgent ?? defaultAgent;
	},
	callbacks.priority.MEDIUM,
	'livechat-check-default-agent-new-room',
);
