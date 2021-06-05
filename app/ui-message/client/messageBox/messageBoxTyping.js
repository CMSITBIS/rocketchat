import { Template } from 'meteor/templating';

import { MsgTyping } from '../../../ui';
import { t } from '../../../utils';
import { getConfig } from '../../../ui-utils/client/config';
import './messageBoxTyping.html';

const maxUsernames = parseInt(getConfig('max-usernames-typing')) || 4;
const activity = 'typing';

Template.messageBoxTyping.helpers({
	data() {
		const users = MsgTyping.get(this.rid);
		if (users.length === 0) {
			return;
		}
		if (users.length === 1) {
			return {
				activity,
				multi: false,
				selfActivity: MsgTyping.selfTyping,
				users: users[0],
			};
		}
		let last = users.pop();
		if (users.length >= maxUsernames) {
			last = t('others');
		}
		let usernames = users.slice(0, maxUsernames - 1).join(', ');
		usernames = [usernames, last];
		return {
			activity,
			multi: true,
			selfActivity: MsgTyping.selfTyping,
			users: usernames.join(` ${ t('and') } `),
		};
	},
});
