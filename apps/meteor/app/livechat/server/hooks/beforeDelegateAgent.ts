import { LivechatDepartmentAgents, Users } from '@rocket.chat/models';

import { callbacks } from '../../../../lib/callbacks';
import { settings } from '../../../settings/server';

callbacks.add(
	'livechat.beforeDelegateAgent',
	async (agent, { department, agents } = {}) => {
		if (agent) {
			return agent;
		}

		if (!settings.get('Livechat_assign_new_conversation_to_bot')) {
			return null;
		}

		if (department) {
			return LivechatDepartmentAgents.getNextBotForDepartment(department, agents);
		}

		return Users.getNextBotAgent();
	},
	callbacks.priority.HIGH,
	'livechat-before-delegate-agent',
);
