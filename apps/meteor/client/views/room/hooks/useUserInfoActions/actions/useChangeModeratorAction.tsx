import React, { ReactElement } from 'react';
import { IRoom, IUser, isRoomFederated } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { escapeHTML } from '@rocket.chat/string-helpers';
import { useTranslation, usePermission, useUserRoom, useUserSubscription, useUser } from '@rocket.chat/ui-contexts';
import { useCallback, useMemo } from 'react';

import { useEndpointAction } from '../../../../../hooks/useEndpointAction';
import { roomCoordinator } from '../../../../../lib/rooms/roomCoordinator';
import type { Action } from '../../../../hooks/useActionSpread';
import { getRoomDirectives } from '../../../lib/getRoomDirectives';
import { useUserHasRoomRole } from '../../useUserHasRoomRole';
import GenericModal from '../../../../../components/GenericModal';
import { useSetModal } from '@rocket.chat/ui-contexts';

const getWarningModalForFederatedRooms = (
	closeModalFn: () => void,
	handleConfirmFn: () => void,
	title: string,
	confirmText: string,
	bodyText: string,
): ReactElement => (
	<GenericModal
		variant='warning'
		onClose={closeModalFn}
		onConfirm={handleConfirmFn}
		onCancel={closeModalFn}
		title={title}
		confirmText={confirmText}
	>
		{bodyText}
	</GenericModal>
);

// TODO: Remove endpoint concatenation
export const useChangeModeratorAction = (user: Pick<IUser, '_id' | 'username'>, rid: IRoom['_id']): Action | undefined => {
	const t = useTranslation();
	const room = useUserRoom(rid);
	const { _id: uid } = user;

	const userCanSetModerator = usePermission('set-moderator', rid);
	const isModerator = useUserHasRoomRole(uid, rid, 'moderator');
	const userSubscription = useUserSubscription(rid);
	const { _id: loggedUserId = '' } = useUser() || {};
	const loggedUserIsModerator = useUserHasRoomRole(loggedUserId, rid, 'moderator');
	const loggedUserIsOwner = useUserHasRoomRole(loggedUserId, rid, 'owner');
	const setModal = useSetModal();
	const closeModal = useCallback(() => setModal(null), [setModal]);

	if (!room) {
		throw Error('Room not provided');
	}

	const endpointPrefix = room.t === 'p' ? '/v1/groups' : '/v1/channels';
	const { roomCanSetModerator } = getRoomDirectives(room, uid, userSubscription);
	const roomName = room?.t && escapeHTML(roomCoordinator.getRoomName(room.t, room));

	const changeModeratorEndpoint = isModerator ? 'removeModerator' : 'addModerator';
	const changeModeratorMessage = isModerator
		? 'User__username__removed_from__room_name__moderators'
		: 'User__username__is_now_a_moderator_of__room_name_';

	const changeModerator = useEndpointAction('POST', `${endpointPrefix}.${changeModeratorEndpoint}`, {
		successMessage: t(changeModeratorMessage, { username: user.username, room_name: roomName }),
	});

	const handleConfirm = useCallback(() => {
		changeModerator({ roomId: rid, userId: uid });
		closeModal();
	}, [changeModerator, rid, uid, closeModal]);

	const handleChangeModerator = useCallback(
		({ userId }) => {
			if (!isRoomFederated(room)) {
				return changeModerator({ roomId: rid, userId: uid });
			}

			const changingOwnRole = userId === loggedUserId;
			if (changingOwnRole && loggedUserIsModerator) {
				return setModal(() =>
					getWarningModalForFederatedRooms(
						closeModal,
						handleConfirm,
						t('Federation_Matrix_losing_privileges'),
						t('Yes_continue'),
						t('Federation_Matrix_losing_privileges_warning'),
					),
				);
			}

			if (changingOwnRole && loggedUserIsOwner) {
				return setModal(() =>
					getWarningModalForFederatedRooms(
						closeModal,
						handleConfirm,
						t('Federation_Matrix_losing_privileges'),
						t('Yes_continue'),
						t('Federation_Matrix_losing_privileges_warning'),
					),
				);
			}

			if (!changingOwnRole && loggedUserIsModerator) {
				return setModal(() =>
					getWarningModalForFederatedRooms(
						closeModal,
						handleConfirm,
						t('Warning'),
						t('Yes_continue'),
						t('Federation_Matrix_giving_same_permission_warning'),
					),
				);
			}

			changeModerator({ roomId: rid, userId: uid });
		},
		[setModal, loggedUserId, loggedUserIsModerator, loggedUserIsOwner, t, rid, uid, changeModerator, closeModal, handleConfirm, room],
	);

	const changeModeratorAction = useMutableCallback(() => handleChangeModerator({ roomId: rid, userId: uid }));
	const changeModeratorOption = useMemo(
		() =>
			(isRoomFederated(room) && roomCanSetModerator) || (!isRoomFederated(room) && roomCanSetModerator && userCanSetModerator)
				? {
						label: t(isModerator ? 'Remove_as_moderator' : 'Set_as_moderator'),
						icon: 'shield-blank',
						action: changeModeratorAction,
				  }
				: undefined,
		[changeModeratorAction, isModerator, roomCanSetModerator, t, userCanSetModerator, room],
	);

	return changeModeratorOption;
};
