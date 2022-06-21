import { MongoInternals } from 'meteor/mongo';
import { VideoConferenceStatus, IStats } from '@rocket.chat/core-typings';

import { readSecondaryPreferred } from '../../../../server/database/readSecondaryPreferred';
import { settings } from '../../../settings/server';
import { VideoConference } from '../../../models/server/raw';

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

export async function getVideoConferenceStatistics(): Promise<IStats['videoConf']> {
	const options = {
		readPreference: readSecondaryPreferred(db),
	};

	return {
		videoConference: {
			started: await VideoConference.countByTypeAndStatus('videoconference', VideoConferenceStatus.STARTED, options),
			ended: await VideoConference.countByTypeAndStatus('videoconference', VideoConferenceStatus.ENDED, options),
		},
		direct: {
			calling: await VideoConference.countByTypeAndStatus('direct', VideoConferenceStatus.CALLING, options),
			started: await VideoConference.countByTypeAndStatus('direct', VideoConferenceStatus.STARTED, options),
			ended: await VideoConference.countByTypeAndStatus('direct', VideoConferenceStatus.ENDED, options),
		},
		livechat: {
			started: await VideoConference.countByTypeAndStatus('livechat', VideoConferenceStatus.STARTED, options),
			ended: await VideoConference.countByTypeAndStatus('livechat', VideoConferenceStatus.ENDED, options),
		},
		settings: {
			provider: settings.get<string>('VideoConf_Default_Provider'),
			dms: !settings.get<boolean>('VideoConf_Disable_DMs'),
			channels: !settings.get<boolean>('VideoConf_Disable_Channels'),
			groups: !settings.get<boolean>('VideoConf_Disable_Groups'),
			teams: !settings.get<boolean>('VideoConf_Disable_Teams'),
		},
	};
}
