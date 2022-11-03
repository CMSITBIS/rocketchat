import type { IRoom } from '@rocket.chat/core-typings';

export const adminFields: Partial<Record<keyof IRoom, 1>> = {
	_id: 1,
	prid: 1,
	fname: 1,
	name: 1,
	t: 1,
	cl: 1,
	u: 1,
	usernames: 1,
	usersCount: 1,
	muted: 1,
	unmuted: 1,
	ro: 1,
	default: 1,
	favorite: 1,
	featured: 1,
	topic: 1,
	msgs: 1,
	archived: 1,
	teamId: 1,
	teamMain: 1,
	announcement: 1,
	description: 1,
	broadcast: 1,
	uids: 1,
	avatarETag: 1,
} as const;
