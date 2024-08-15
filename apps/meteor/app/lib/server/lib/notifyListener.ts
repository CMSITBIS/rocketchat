import { api, dbWatchersDisabled } from '@rocket.chat/core-services';
import type {
	IRocketChatRecord,
	IRoom,
	ILoginServiceConfiguration,
	ISetting,
	IRole,
	IPermission,
	IIntegration,
	IPbxEvent,
	LoginServiceConfiguration as LoginServiceConfigurationData,
	ILivechatInquiryRecord,
	ILivechatPriority,
	ILivechatDepartmentAgents,
	IEmailInbox,
	IIntegrationHistory,
	AtLeast,
	ISubscription,
	ISettingColor,
	IUser,
	IMessage,
	SettingValue,
	MessageTypesValues,
} from '@rocket.chat/core-typings';
import {
	Rooms,
	Permissions,
	Settings,
	PbxEvents,
	Roles,
	Integrations,
	LoginServiceConfiguration,
	IntegrationHistory,
	Subscriptions,
	LivechatInquiry,
	LivechatDepartmentAgents,
	Users,
	Messages,
} from '@rocket.chat/models';
import mem from 'mem';

import { shouldHideSystemMessage } from '../../../../server/lib/systemMessage/hideSystemMessage';

type ClientAction = 'inserted' | 'updated' | 'removed';

function withDbWatcherCheck<T extends (...args: any[]) => Promise<void>>(fn: T): T {
	return dbWatchersDisabled ? fn : ((() => Promise.resolve()) as T);
}

export const notifyOnLivechatPriorityChanged = withDbWatcherCheck(
	async (data: Pick<ILivechatPriority, 'name' | '_id'>, clientAction: ClientAction = 'updated'): Promise<void> => {
		const { _id, ...rest } = data;
		void api.broadcast('watch.priorities', { clientAction, id: _id, diff: { ...rest } });
	},
);

export const notifyOnRoomChanged = withDbWatcherCheck(
	async <T extends IRocketChatRecord>(data: T | T[], clientAction: ClientAction = 'updated'): Promise<void> => {
		const items = Array.isArray(data) ? data : [data];
		for (const item of items) {
			void api.broadcast('watch.rooms', { clientAction, room: item });
		}
	},
);

export const notifyOnRoomChangedById = withDbWatcherCheck(
	async <T extends IRocketChatRecord>(ids: T['_id'] | T['_id'][], clientAction: ClientAction = 'updated'): Promise<void> => {
		const eligibleIds = Array.isArray(ids) ? ids : [ids];
		const items = Rooms.findByIds(eligibleIds);
		for await (const item of items) {
			void api.broadcast('watch.rooms', { clientAction, room: item });
		}
	},
);

export const notifyOnRoomChangedByUsernamesOrUids = withDbWatcherCheck(
	async <T extends IRoom>(
		uids: T['u']['_id'][],
		usernames: T['u']['username'][],
		clientAction: ClientAction = 'updated',
	): Promise<void> => {
		const items = Rooms.findByUsernamesOrUids(uids, usernames);
		for await (const item of items) {
			void api.broadcast('watch.rooms', { clientAction, room: item });
		}
	},
);

export const notifyOnRoomChangedByUserDM = withDbWatcherCheck(
	async <T extends IRoom>(userId: T['u']['_id'], clientAction: ClientAction = 'updated'): Promise<void> => {
		const items = Rooms.findDMsByUids([userId]);
		for await (const item of items) {
			void api.broadcast('watch.rooms', { clientAction, room: item });
		}
	},
);

export const notifyOnPermissionChanged = withDbWatcherCheck(
	async (permission: IPermission, clientAction: ClientAction = 'updated'): Promise<void> => {
		void api.broadcast('permission.changed', { clientAction, data: permission });

		if (permission.level === 'settings' && permission.settingId) {
			const setting = await Settings.findOneNotHiddenById(permission.settingId);
			if (!setting) {
				return;
			}
			void notifyOnSettingChanged(setting, 'updated');
		}
	},
);

export const notifyOnPermissionChangedById = withDbWatcherCheck(
	async (pid: IPermission['_id'], clientAction: ClientAction = 'updated'): Promise<void> => {
		const permission = await Permissions.findOneById(pid);
		if (!permission) {
			return;
		}

		return notifyOnPermissionChanged(permission, clientAction);
	},
);

export const notifyOnPbxEventChangedById = withDbWatcherCheck(
	async <T extends IPbxEvent>(id: T['_id'], clientAction: ClientAction = 'updated'): Promise<void> => {
		const item = await PbxEvents.findOneById(id);
		if (!item) {
			return;
		}

		void api.broadcast('watch.pbxevents', { clientAction, id, data: item });
	},
);

export const notifyOnRoleChanged = withDbWatcherCheck(
	async <T extends IRole>(role: T, clientAction: 'removed' | 'changed' = 'changed'): Promise<void> => {
		void api.broadcast('watch.roles', { clientAction, role });
	},
);

export const notifyOnRoleChangedById = withDbWatcherCheck(
	async <T extends IRole>(id: T['_id'], clientAction: 'removed' | 'changed' = 'changed'): Promise<void> => {
		const role = await Roles.findOneById(id);
		if (!role) {
			return;
		}

		void notifyOnRoleChanged(role, clientAction);
	},
);

export const notifyOnLoginServiceConfigurationChanged = withDbWatcherCheck(
	async <T extends ILoginServiceConfiguration>(
		service: Partial<T> & Pick<T, '_id'>,
		clientAction: ClientAction = 'updated',
	): Promise<void> => {
		void api.broadcast('watch.loginServiceConfiguration', {
			clientAction,
			id: service._id,
			data: service,
		});
	},
);

export const notifyOnLoginServiceConfigurationChangedByService = withDbWatcherCheck(
	async <T extends ILoginServiceConfiguration>(service: T['service'], clientAction: ClientAction = 'updated'): Promise<void> => {
		const item = await LoginServiceConfiguration.findOneByService<Omit<LoginServiceConfigurationData, 'secret'>>(service, {
			projection: { secret: 0 },
		});
		if (!item) {
			return;
		}

		void notifyOnLoginServiceConfigurationChanged(item, clientAction);
	},
);

export const notifyOnIntegrationChanged = withDbWatcherCheck(
	async <T extends IIntegration>(data: T, clientAction: ClientAction = 'updated'): Promise<void> => {
		void api.broadcast('watch.integrations', { clientAction, id: data._id, data });
	},
);

export const notifyOnIntegrationChangedById = withDbWatcherCheck(
	async <T extends IIntegration>(id: T['_id'], clientAction: ClientAction = 'updated'): Promise<void> => {
		const item = await Integrations.findOneById(id);
		if (!item) {
			return;
		}

		void api.broadcast('watch.integrations', { clientAction, id: item._id, data: item });
	},
);

export const notifyOnIntegrationChangedByUserId = withDbWatcherCheck(
	async <T extends IIntegration>(id: T['userId'], clientAction: ClientAction = 'updated'): Promise<void> => {
		const items = Integrations.findByUserId(id);

		for await (const item of items) {
			void api.broadcast('watch.integrations', { clientAction, id: item._id, data: item });
		}
	},
);

export const notifyOnIntegrationChangedByChannels = withDbWatcherCheck(
	async <T extends IIntegration>(channels: T['channel'], clientAction: ClientAction = 'updated'): Promise<void> => {
		const items = Integrations.findByChannels(channels);

		for await (const item of items) {
			void api.broadcast('watch.integrations', { clientAction, id: item._id, data: item });
		}
	},
);

export const notifyOnEmailInboxChanged = withDbWatcherCheck(
	async <T extends IEmailInbox>(
		data: Pick<T, '_id'> | T, // TODO: improve typing
		clientAction: ClientAction = 'updated',
	): Promise<void> => {
		void api.broadcast('watch.emailInbox', { clientAction, id: data._id, data });
	},
);

export const notifyOnLivechatInquiryChanged = withDbWatcherCheck(
	async (
		data: ILivechatInquiryRecord | ILivechatInquiryRecord[],
		clientAction: ClientAction = 'updated',
		diff?: Partial<Record<keyof ILivechatInquiryRecord, unknown> & { queuedAt: unknown; takenAt: unknown }>,
	): Promise<void> => {
		const items = Array.isArray(data) ? data : [data];

		for (const item of items) {
			void api.broadcast('watch.inquiries', { clientAction, inquiry: item, diff });
		}
	},
);

export const notifyOnLivechatInquiryChangedById = withDbWatcherCheck(
	async (
		id: ILivechatInquiryRecord['_id'],
		clientAction: ClientAction = 'updated',
		diff?: Partial<Record<keyof ILivechatInquiryRecord, unknown> & { queuedAt: unknown; takenAt: unknown }>,
	): Promise<void> => {
		const inquiry = clientAction === 'removed' ? await LivechatInquiry.trashFindOneById(id) : await LivechatInquiry.findOneById(id);

		if (!inquiry) {
			return;
		}

		void api.broadcast('watch.inquiries', { clientAction, inquiry, diff });
	},
);

export const notifyOnLivechatInquiryChangedByRoom = withDbWatcherCheck(
	async (
		rid: ILivechatInquiryRecord['rid'],
		clientAction: ClientAction = 'updated',
		diff?: Partial<Record<keyof ILivechatInquiryRecord, unknown> & { queuedAt: unknown; takenAt: unknown }>,
	): Promise<void> => {
		const inquiry = await LivechatInquiry.findOneByRoomId(rid, {});

		if (!inquiry) {
			return;
		}

		void api.broadcast('watch.inquiries', { clientAction, inquiry, diff });
	},
);

export const notifyOnLivechatInquiryChangedByToken = withDbWatcherCheck(
	async (
		token: ILivechatInquiryRecord['v']['token'],
		clientAction: ClientAction = 'updated',
		diff?: Partial<Record<keyof ILivechatInquiryRecord, unknown> & { queuedAt: unknown; takenAt: unknown }>,
	): Promise<void> => {
		const inquiry = await LivechatInquiry.findOneByToken(token);

		if (!inquiry) {
			return;
		}

		void api.broadcast('watch.inquiries', { clientAction, inquiry, diff });
	},
);

export const notifyOnIntegrationHistoryChanged = withDbWatcherCheck(
	async <T extends IIntegrationHistory>(
		data: AtLeast<T, '_id'>,
		clientAction: ClientAction = 'updated',
		diff: Partial<T> = {},
	): Promise<void> => {
		void api.broadcast('watch.integrationHistory', { clientAction, id: data._id, data, diff });
	},
);

export const notifyOnIntegrationHistoryChangedById = withDbWatcherCheck(
	async <T extends IIntegrationHistory>(id: T['_id'], clientAction: ClientAction = 'updated', diff: Partial<T> = {}): Promise<void> => {
		const item = await IntegrationHistory.findOneById(id);

		if (!item) {
			return;
		}

		void api.broadcast('watch.integrationHistory', { clientAction, id: item._id, data: item, diff });
	},
);

export const notifyOnLivechatDepartmentAgentChanged = withDbWatcherCheck(
	async <T extends ILivechatDepartmentAgents>(
		data: Partial<T> & Pick<T, '_id' | 'agentId' | 'departmentId'>,
		clientAction: ClientAction = 'updated',
	): Promise<void> => {
		void api.broadcast('watch.livechatDepartmentAgents', { clientAction, id: data._id, data });
	},
);

export const notifyOnLivechatDepartmentAgentChangedByDepartmentId = withDbWatcherCheck(
	async <T extends ILivechatDepartmentAgents>(
		departmentId: T['departmentId'],
		clientAction: 'inserted' | 'updated' = 'updated',
	): Promise<void> => {
		const items = LivechatDepartmentAgents.findByDepartmentId(departmentId, { projection: { _id: 1, agentId: 1, departmentId: 1 } });

		for await (const item of items) {
			void api.broadcast('watch.livechatDepartmentAgents', { clientAction, id: item._id, data: item });
		}
	},
);

export const notifyOnLivechatDepartmentAgentChangedByAgentsAndDepartmentId = withDbWatcherCheck(
	async <T extends ILivechatDepartmentAgents>(
		agentsIds: T['agentId'][],
		departmentId: T['departmentId'],
		clientAction: 'inserted' | 'updated' = 'updated',
	): Promise<void> => {
		const items = LivechatDepartmentAgents.findByAgentsAndDepartmentId(agentsIds, departmentId, {
			projection: { _id: 1, agentId: 1, departmentId: 1 },
		});

		for await (const item of items) {
			void api.broadcast('watch.livechatDepartmentAgents', { clientAction, id: item._id, data: item });
		}
	},
);

export const notifyOnSettingChanged = withDbWatcherCheck(
	async (setting: ISetting & { editor?: ISettingColor['editor'] }, clientAction: ClientAction = 'updated'): Promise<void> => {
		void api.broadcast('watch.settings', { clientAction, setting });
	},
);

export const notifyOnSettingChangedById = withDbWatcherCheck(
	async (id: ISetting['_id'], clientAction: ClientAction = 'updated'): Promise<void> => {
		const item = clientAction === 'removed' ? await Settings.trashFindOneById(id) : await Settings.findOneById(id);

		if (!item) {
			return;
		}

		void api.broadcast('watch.settings', { clientAction, setting: item });
	},
);

type NotifyUserChange = {
	id: IUser['_id'];
	clientAction: 'inserted' | 'removed' | 'updated';
	data?: IUser;
	diff?: Record<string, any>;
	unset?: Record<string, number>;
};

export const notifyOnUserChange = withDbWatcherCheck(async ({ clientAction, id, data, diff, unset }: NotifyUserChange) => {
	if (clientAction === 'removed') {
		void api.broadcast('watch.users', { clientAction, id });
		return;
	}

	if (clientAction === 'inserted') {
		void api.broadcast('watch.users', { clientAction, id, data: data! });
		return;
	}

	void api.broadcast('watch.users', { clientAction, diff: diff!, unset: unset || {}, id });
});

/**
 * Calls the callback only if DB Watchers are disabled
 */
export const notifyOnUserChangeAsync = withDbWatcherCheck(async (cb: () => Promise<NotifyUserChange | NotifyUserChange[] | void>) => {
	const result = await cb();
	if (!result) {
		return;
	}

	if (Array.isArray(result)) {
		result.forEach((n) => notifyOnUserChange(n));
		return;
	}

	return notifyOnUserChange(result);
});

// TODO this may be only useful on 'inserted'
export const notifyOnUserChangeById = withDbWatcherCheck(
	async ({ clientAction, id }: { id: IUser['_id']; clientAction: 'inserted' | 'removed' | 'updated' }) => {
		const user = await Users.findOneById(id);
		if (!user) {
			return;
		}

		void notifyOnUserChange({ id, clientAction, data: user });
	},
);

const getUserNameCached = mem(
	async (userId: string): Promise<string | undefined> => {
		const user = await Users.findOne<Pick<IUser, 'name'>>(userId, { projection: { name: 1 } });
		return user?.name;
	},
	{ maxAge: 10000 },
);

const getSettingCached = mem(async (setting: string): Promise<SettingValue> => Settings.getValueById(setting), { maxAge: 10000 });

export async function getMessageToBroadcast({ id, data }: { id: IMessage['_id']; data?: IMessage }): Promise<IMessage | void> {
	const message = data ?? (await Messages.findOneById(id));
	if (!message) {
		return;
	}

	if (message.t) {
		const hiddenSystemMessages = (await getSettingCached('Hide_System_Messages')) as MessageTypesValues[];
		const shouldHide = shouldHideSystemMessage(message.t, hiddenSystemMessages);

		if (shouldHide) {
			return;
		}
	}

	if (message._hidden || message.imported != null) {
		return;
	}

	const useRealName = (await getSettingCached('UI_Use_Real_Name')) === true;
	if (useRealName) {
		if (message.u?._id) {
			const name = await getUserNameCached(message.u._id);
			if (name) {
				message.u.name = name;
			}
		}

		if (message.mentions?.length) {
			for await (const mention of message.mentions) {
				const name = await getUserNameCached(mention._id);
				if (name) {
					mention.name = name;
				}
			}
		}
	}

	return message;
}

export const notifyOnMessageChange = withDbWatcherCheck(async ({ id, data }: { id: IMessage['_id']; data?: IMessage }): Promise<void> => {
	if (!dbWatchersDisabled) {
		return;
	}
	const message = await getMessageToBroadcast({ id, data });
	if (!message) {
		return;
	}
	void api.broadcast('watch.messages', { message });
});

export const notifyOnSubscriptionChanged = withDbWatcherCheck(
	async (subscription: ISubscription, clientAction: Exclude<ClientAction, 'removed'> = 'updated'): Promise<void> => {
		void api.broadcast('watch.subscriptions', { clientAction, subscription });
	},
);

export async function notifyOnSubscriptionChangedByRoomIdAndUserId(
	rid: ISubscription['rid'],
	uid: ISubscription['u']['_id'],
	clientAction: ClientAction = 'updated',
): Promise<void> {
	if (!dbWatchersDisabled) {
		return;
	}

	const subscriptions =
		clientAction === 'removed'
			? Subscriptions.trashFind({ rid, 'u._id': uid }, { projection: subscriptionFields })
			: Subscriptions.findByUserIdAndRoomIds(uid, [rid], { projection: subscriptionFields });

	if (!subscriptions) {
		return;
	}

	for await (const subscription of subscriptions) {
		void api.broadcast('watch.subscriptions', { clientAction, subscription });
	}
}

export async function notifyOnSubscriptionChangedById(
	id: ISubscription['_id'],
	clientAction: Exclude<ClientAction, 'removed'> = 'updated',
): Promise<void> {
	if (!dbWatchersDisabled) {
		return;
	}

	const subscription = await Subscriptions.findOneById(id);
	if (!subscription) {
		return;
	}

	void api.broadcast('watch.subscriptions', { clientAction, subscription });
}

export async function notifyOnSubscriptionChangedByUserPreferences(
	uid: ISubscription['u']['_id'],
	notificationOriginField: keyof ISubscription,
	originFieldNotEqualValue: 'user' | 'subscription',
	clientAction: Exclude<ClientAction, 'removed'> = 'updated',
): Promise<void> {
	if (!dbWatchersDisabled) {
		return;
	}

	const subscriptions = Subscriptions.findByUserPreferences(uid, notificationOriginField, originFieldNotEqualValue, {
		projection: subscriptionFields,
	});

	for await (const subscription of subscriptions) {
		void api.broadcast('watch.subscriptions', { clientAction, subscription });
	}
}

export async function notifyOnSubscriptionChangedByRoomId(
	rid: ISubscription['rid'],
	clientAction: ClientAction = 'updated',
): Promise<void> {
	if (!dbWatchersDisabled) {
		return;
	}

	const subscriptions =
		clientAction === 'removed'
			? Subscriptions.trashFind({ rid }, { projection: subscriptionFields })
			: Subscriptions.findByRoomId(rid, { projection: subscriptionFields });

	if (!subscriptions) {
		return;
	}

	for await (const subscription of subscriptions) {
		void api.broadcast('watch.subscriptions', { clientAction, subscription });
	}
}

export async function notifyOnSubscriptionChangedByAutoTranslateAndUserId(
	uid: ISubscription['u']['_id'],
	clientAction: Exclude<ClientAction, 'removed'> = 'updated',
): Promise<void> {
	if (!dbWatchersDisabled) {
		return;
	}

	const subscriptions = Subscriptions.findByAutoTranslateAndUserId(uid, true, { projection: subscriptionFields });

	for await (const subscription of subscriptions) {
		void api.broadcast('watch.subscriptions', { clientAction, subscription });
	}
}

export async function notifyOnSubscriptionChangedByUserIdAndRoomType(
	uid: ISubscription['u']['_id'],
	t: ISubscription['t'],
	clientAction: Exclude<ClientAction, 'removed'> = 'updated',
): Promise<void> {
	if (!dbWatchersDisabled) {
		return;
	}

	const subscriptions = Subscriptions.findByUserIdAndRoomType(uid, t, { projection: subscriptionFields });

	for await (const subscription of subscriptions) {
		void api.broadcast('watch.subscriptions', { clientAction, subscription });
	}
}

export async function notifyOnSubscriptionChangedByNameAndRoomType(
	filter: Partial<Pick<ISubscription, 'name' | 't'>>,
	clientAction: Exclude<ClientAction, 'removed'> = 'updated',
): Promise<void> {
	if (!dbWatchersDisabled) {
		return;
	}

	const subscriptions = Subscriptions.findByNameAndRoomType(filter, { projection: subscriptionFields });

	for await (const subscription of subscriptions) {
		void api.broadcast('watch.subscriptions', { clientAction, subscription });
	}
}

export async function notifyOnSubscriptionChangedByUserId(
	uid: ISubscription['u']['_id'],
	clientAction: Exclude<ClientAction, 'removed'> = 'updated',
): Promise<void> {
	if (!dbWatchersDisabled) {
		return;
	}

	const subscriptions = Subscriptions.findByUserId(uid, { projection: subscriptionFields });

	for await (const subscription of subscriptions) {
		void api.broadcast('watch.subscriptions', { clientAction, subscription });
	}
}

export async function notifyOnSubscriptionChangedByRoomIdAndUserIds(
	rid: ISubscription['rid'],
	uids: ISubscription['u']['_id'][],
	clientAction: Exclude<ClientAction, 'removed'> = 'updated',
): Promise<void> {
	if (!dbWatchersDisabled) {
		return;
	}

	const subscriptions = Subscriptions.findByRoomIdAndUserIds(rid, uids, { projection: subscriptionFields });

	for await (const subscription of subscriptions) {
		void api.broadcast('watch.subscriptions', { clientAction, subscription });
	}
}

const subscriptionFields = {
	t: 1,
	ts: 1,
	ls: 1,
	lr: 1,
	name: 1,
	fname: 1,
	rid: 1,
	code: 1,
	f: 1,
	u: 1,
	open: 1,
	alert: 1,
	roles: 1,
	unread: 1,
	prid: 1,
	userMentions: 1,
	groupMentions: 1,
	archived: 1,
	audioNotificationValue: 1,
	desktopNotifications: 1,
	mobilePushNotifications: 1,
	emailNotifications: 1,
	desktopPrefOrigin: 1,
	mobilePrefOrigin: 1,
	emailPrefOrigin: 1,
	unreadAlert: 1,
	// _updatedAt: 1,
	blocked: 1,
	blocker: 1,
	autoTranslate: 1,
	autoTranslateLanguage: 1,
	disableNotifications: 1,
	hideUnreadStatus: 1,
	hideMentionStatus: 1,
	muteGroupMentions: 1,
	ignored: 1,
	E2EKey: 1,
	E2ESuggestedKey: 1,
	tunread: 1,
	tunreadGroup: 1,
	tunreadUser: 1,

	// Omnichannel fields
	department: 1,
	v: 1,
	onHold: 1,
};
