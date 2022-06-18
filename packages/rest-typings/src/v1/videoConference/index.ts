import type { VideoConferenceInstructions, VideoConference, VideoConferenceCapabilities } from '@rocket.chat/core-typings';

import type { VideoConfInfoProps } from './VideoConfInfoProps';
import type { VideoConfListProps } from './VideoConfListProps';
import type { VideoConfStartProps } from './VideoConfStartProps';
import type { VideoConfJoinProps } from './VideoConfJoinProps';
import type { VideoConfCancelProps } from './VideoConfCancelProps';
import type { PaginatedResult } from '../../helpers/PaginatedResult';

export * from './VideoConfInfoProps';
export * from './VideoConfListProps';
export * from './VideoConfStartProps';
export * from './VideoConfJoinProps';
export * from './VideoConfCancelProps';

export type VideoConferenceEndpoints = {
	'/v1/video-conference.start': {
		POST: (params: VideoConfStartProps) => { data: VideoConferenceInstructions };
	};

	'/v1/video-conference.join': {
		POST: (params: VideoConfJoinProps) => { url: string };
	};

	'/v1/video-conference.cancel': {
		POST: (params: VideoConfCancelProps) => void;
	};

	'/v1/video-conference.info': {
		GET: (params: VideoConfInfoProps) => VideoConference;
	};

	'/v1/video-conference.list': {
		GET: (params: VideoConfListProps) => PaginatedResult<{ data: VideoConference[] }>;
	};

	'video-conference.capabilities': {
		GET: () => { providerName: string; capabilities: VideoConferenceCapabilities };
	};

	'video-conference.providers': {
		GET: () => { data: { key: string; label: string }[] };
	};
};
