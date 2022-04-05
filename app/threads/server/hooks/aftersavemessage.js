import { Meteor } from 'meteor/meteor';

import { Messages, Subscriptions } from '../../../models/server';
import { callbacks } from '../../../../lib/callbacks';
import { settings } from '../../../settings/server';
import { reply } from '../functions';
import { updateThreadUsersSubscriptions, getMentions } from '../../../lib/server/lib/notifyUsersOnMessage';
import { sendMessageNotifications, sendNotification } from '../../../lib/server/lib/sendNotificationsOnMessage';
import { callJoinRoom } from '../../../lib/server/functions/notifications';

function notifyUsersOnReply(message, replies, room) {
	// skips this callback if the message was edited
	if (message.editedAt) {
		return message;
	}

	updateThreadUsersSubscriptions(message, room, replies);

	return message;
}

const metaData = (message, parentMessage, followers) => {
	reply({ tmid: message.tmid }, message, parentMessage, followers);

	return message;
};

const notification = (message, room, replies) => {
	// skips this callback if the message was edited
	if (message.editedAt) {
		return message;
	}

	// will send a notification to everyone who replied/followed the thread except the owner of the message
	return sendMessageNotifications(message, room, replies);
};

export const processThreads = async (message, room) => {
	if (!message.tmid) {
		return message;
	}

	const parentMessage = Messages.findOneById(message.tmid);
	if (!parentMessage) {
		return message;
	}

	const { mentionIds } = getMentions(message);

	const replies = [
		...new Set([
			...((!parentMessage.tcount ? [parentMessage.u._id] : parentMessage.replies) || []),
			...(!parentMessage.tcount && room.t === 'd' ? room.uids : []),
			...mentionIds,
		]),
	].filter((userId) => userId !== message.u._id);

	notifyUsersOnReply(message, replies, room);
	metaData(message, parentMessage, replies);

	const { sender, hasMentionToAll, hasMentionToHere, notificationMessage, mentionIdsWithoutGroups } = await notification(
		message,
		room,
		replies,
	);

	if (room.t === 'c') {
		const mentions = [...mentionIdsWithoutGroups];
		Subscriptions.findByRoomIdAndUserIds(room._id, mentionIdsWithoutGroups, { fields: { 'u._id': 1 } }).forEach((subscription) => {
			const index = mentions.indexOf(subscription.u._id);
			if (index !== -1) {
				mentions.splice(index, 1);
			}
		});

		try {
			const users = await Promise.all(
				mentions.map(async (userId) => {
					await callJoinRoom(userId, room._id);

					return userId;
				}),
			);

			users.forEach((userId) => {
				const subscription = Subscriptions.findOneByRoomIdAndUserId(room._id, userId);

				sendNotification({
					subscription,
					sender,
					hasMentionToAll,
					hasMentionToHere,
					message,
					notificationMessage,
					room,
					mentionIds,
				});
			});
		} catch (error) {
			throw new Meteor.Error(error);
		}
	}

	return message;
};

Meteor.startup(function () {
	settings.watch('Threads_enabled', function (value) {
		if (!value) {
			callbacks.remove('afterSaveMessage', 'threads-after-save-message');
			return;
		}
		callbacks.add('afterSaveMessage', processThreads, callbacks.priority.LOW, 'threads-after-save-message');
	});
});
