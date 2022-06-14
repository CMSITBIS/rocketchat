import { IRoom } from '@rocket.chat/core-typings';

import { RoomMemberActions } from '../../../../definition/IRoomTypeConfig';
import { roomCoordinator } from '../../../lib/rooms/roomCoordinator';

export const getRoomDirectives = (room: IRoom): { [key: string]: boolean } => {
	const roomDirectives = room?.t && roomCoordinator.getRoomDirectives(room.t);

	const [roomCanSetOwner, roomCanSetLeader, roomCanSetModerator, roomCanIgnore, roomCanBlock, roomCanMute, roomCanRemove] = [
		...((roomDirectives && [
			roomDirectives.allowMemberAction(room, RoomMemberActions.SET_AS_OWNER),
			roomDirectives.allowMemberAction(room, RoomMemberActions.SET_AS_LEADER),
			roomDirectives.allowMemberAction(room, RoomMemberActions.SET_AS_MODERATOR),
			roomDirectives.allowMemberAction(room, RoomMemberActions.IGNORE),
			roomDirectives.allowMemberAction(room, RoomMemberActions.BLOCK),
			roomDirectives.allowMemberAction(room, RoomMemberActions.MUTE),
			roomDirectives.allowMemberAction(room, RoomMemberActions.REMOVE_USER),
		]) ??
			[]),
	];

	return { roomCanSetOwner, roomCanSetLeader, roomCanSetModerator, roomCanIgnore, roomCanBlock, roomCanMute, roomCanRemove };
};
