import { Meteor } from 'meteor/meteor';

import { hasPermission } from '../../../authorization/server';
import { Livechat } from '../lib/Livechat';

Meteor.methods({
	'livechat:removeManager'(username) {
		if (!Meteor.userId() || !hasPermission(Meteor.userId(), 'manage-livechat-managers')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'livechat:removeManager',
			});
		}

		return Livechat.removeManager(username);
	},
});
