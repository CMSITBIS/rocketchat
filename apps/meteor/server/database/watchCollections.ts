import {
	Messages,
	Users,
	Subscriptions,
	Settings,
	LivechatInquiry,
	LivechatDepartmentAgents,
	Rooms,
	Roles,
	LoginServiceConfiguration,
	InstanceStatus,
	IntegrationHistory,
	Integrations,
	EmailInbox,
	PbxEvents,
	Permissions,
	LivechatPriority,
} from '@rocket.chat/models';

export function getWatchCollections(): string[] {
	return [
		Messages.getCollectionName(),
		Users.getCollectionName(),
		Subscriptions.getCollectionName(),
		LivechatInquiry.getCollectionName(),
		LivechatDepartmentAgents.getCollectionName(),
		Permissions.getCollectionName(),
		Roles.getCollectionName(),
		Rooms.getCollectionName(),
		LoginServiceConfiguration.getCollectionName(),
		InstanceStatus.getCollectionName(),
		IntegrationHistory.getCollectionName(),
		Integrations.getCollectionName(),
		EmailInbox.getCollectionName(),
		PbxEvents.getCollectionName(),
		Settings.getCollectionName(),
		LivechatPriority.getCollectionName(),
	];
}
