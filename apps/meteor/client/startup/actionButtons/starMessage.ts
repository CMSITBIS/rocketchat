import { Meteor } from 'meteor/meteor';

import { settings } from '../../../app/settings/client';
import { sdk } from '../../../app/utils/client/lib/SDKClient';
import { queryClient } from '../../lib/queryClient';
import { roomCoordinator } from '../../lib/rooms/roomCoordinator';
import { dispatchToastMessage } from '../../lib/toast';
import { ui } from '../../lib/ui';
import { messageArgs } from '../../lib/utils/messageArgs';

Meteor.startup(() => {
	ui.addMessageAction({
		id: 'star-message',
		icon: 'star',
		label: 'Star',
		context: ['starred', 'message', 'message-mobile', 'threads', 'federated'],
		async action(_, props) {
			const { message = messageArgs(this).msg } = props;

			try {
				await sdk.call('starMessage', { ...message, starred: true });
				queryClient.invalidateQueries(['rooms', message.rid, 'starred-messages']);
			} catch (error) {
				if (error) {
					dispatchToastMessage({ type: 'error', message: error });
				}
			}
		},
		condition({ message, subscription, user, room }) {
			if (subscription == null && settings.get('Message_AllowStarring')) {
				return false;
			}
			const isLivechatRoom = roomCoordinator.isLivechatRoom(room.t);
			if (isLivechatRoom) {
				return false;
			}

			return !Array.isArray(message.starred) || !message.starred.find((star: any) => star._id === user?._id);
		},
		order: 9,
		group: 'menu',
	});
});
