import { Meteor } from 'meteor/meteor';

import { settings } from '../../../../app/settings';
import { checkWaitingQueue, updateAbandonedRoomProperty } from './lib/Helper';
import { VisitorInactivityMonitor } from './lib/VisitorInactivityMonitor';
import './lib/query.helper';

const visitorActivityMonitor = new VisitorInactivityMonitor();

Meteor.startup(function() {
	settings.onload('Livechat_maximum_chats_per_agent', function(/* key, value */) {
		checkWaitingQueue();
	});
	settings.onload('Livechat_auto_close_abandoned_rooms', function(_, value) {
		updateAbandonedRoomProperty(value);
		if (!value) {
			return visitorActivityMonitor.stop();
		}
		visitorActivityMonitor.start();
	});
	settings.onload('Livechat_visitor_inactivity_timeout', function() {
		const closeAbandonedRooms = settings.get('Livechat_auto_close_abandoned_rooms');
		if (closeAbandonedRooms) {
			updateAbandonedRoomProperty(closeAbandonedRooms);
		}
	});
});
