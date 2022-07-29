import { RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { IMessage } from '@rocket.chat/core-typings';

import { FederatedRoom } from '../../domain/FederatedRoom';
import { FederatedUser } from '../../domain/FederatedUser';
import { IFederationBridge } from '../../domain/IFederationBridge';
import { RocketChatRoomAdapter } from '../../infrastructure/rocket-chat/adapters/Room';
import { RocketChatSettingsAdapter } from '../../infrastructure/rocket-chat/adapters/Settings';
import { RocketChatUserAdapter } from '../../infrastructure/rocket-chat/adapters/User';
import { FederationService } from '../AbstractFederationService';
import {
	FederationAfterLeaveRoomDto,
	FederationAfterRemoveUserFromRoomDto,
	FederationCreateDMAndInviteUserDto,
	FederationRoomSendExternalMessageDto,
} from '../input/RoomSenderDto';

export class FederationRoomServiceSender extends FederationService {
	constructor(
		protected internalRoomAdapter: RocketChatRoomAdapter,
		protected internalUserAdapter: RocketChatUserAdapter,
		protected internalSettingsAdapter: RocketChatSettingsAdapter,
		protected bridge: IFederationBridge,
	) {
		super(bridge, internalUserAdapter, internalSettingsAdapter);
	}

	public async createDirectMessageRoomAndInviteUser(roomCreateDMAndInviteUserInput: FederationCreateDMAndInviteUserDto): Promise<void> {
		const { normalizedInviteeId, rawInviteeId, internalInviterId, inviteeUsernameOnly } = roomCreateDMAndInviteUserInput;

		const internalInviterUser = await this.internalUserAdapter.getFederatedUserByInternalId(internalInviterId);
		if (!internalInviterUser) {
			const internalUser = await this.internalUserAdapter.getInternalUserById(internalInviterId);
			if (!internalUser || !internalUser?.username) {
				throw new Error(`Could not find user id for ${internalInviterId}`);
			}
			const name = internalUser.name || internalUser.username;
			const externalInviterId = await this.bridge.createUser(
				internalUser.username,
				name,
				this.internalHomeServerDomain,
			);
			const existsOnlyOnProxyServer = true;
			await this.createFederatedUser(externalInviterId, internalUser.username, existsOnlyOnProxyServer, name);
		}

		const internalInviteeUser = await this.internalUserAdapter.getFederatedUserByInternalId(normalizedInviteeId);
		if (!internalInviteeUser) {
			const existsOnlyOnProxyServer = false;
			await this.createFederatedUser(rawInviteeId, normalizedInviteeId, existsOnlyOnProxyServer);
		}
		const federatedInviterUser = internalInviterUser || (await this.internalUserAdapter.getFederatedUserByInternalId(internalInviterId));
		const federatedInviteeUser =
			internalInviteeUser || (await this.internalUserAdapter.getFederatedUserByInternalUsername(normalizedInviteeId));
		if (!federatedInviterUser || !federatedInviteeUser) {
			throw new Error('Could not find inviter or invitee user');
		}

		const isInviteeFromTheSameHomeServer = FederatedUser.isAnInternalUser(
			this.bridge.extractHomeserverOrigin(rawInviteeId),
			this.internalHomeServerDomain,
		);

		const internalRoomId = FederatedRoom.buildRoomIdForDirectMessages(federatedInviterUser, federatedInviteeUser);
		const internalFederatedRoom = await this.internalRoomAdapter.getFederatedRoomByInternalId(internalRoomId);

		if (!internalFederatedRoom) {
			const externalRoomId = await this.bridge.createDirectMessageRoom(federatedInviterUser.externalId, [federatedInviteeUser.externalId]);
			const newFederatedRoom = FederatedRoom.createInstance(
				externalRoomId,
				externalRoomId,
				federatedInviterUser,
				RoomType.DIRECT_MESSAGE,
				undefined,
				[federatedInviterUser, federatedInviteeUser],
			);
			await this.internalRoomAdapter.createFederatedRoom(newFederatedRoom);
		}

		const federatedRoom = internalFederatedRoom || (await this.internalRoomAdapter.getFederatedRoomByInternalId(internalRoomId));
		if (!federatedRoom) {
			throw new Error(`Could not find room id for ${internalRoomId}`);
		}
		if (isInviteeFromTheSameHomeServer) {
			// TODO: this might not be necessary, needs to double check
			await this.bridge.createUser(inviteeUsernameOnly, federatedInviteeUser.getName() || normalizedInviteeId, this.internalHomeServerDomain);
			await this.bridge.inviteToRoom(federatedRoom.externalId, federatedInviterUser.externalId, federatedInviteeUser.externalId);
			await this.bridge.joinRoom(federatedRoom.externalId, federatedInviteeUser.externalId);
		}
		await this.internalRoomAdapter.addUserToRoom(federatedRoom, federatedInviteeUser, federatedInviterUser);
	}

	public async onUserLeftRoom(afterLeaveRoomInput: FederationAfterLeaveRoomDto): Promise<void> {
		const { internalRoomId, internalUserId } = afterLeaveRoomInput;

		const federatedRoom = await this.internalRoomAdapter.getFederatedRoomByInternalId(internalRoomId);
		if (!federatedRoom) {
			return;
		}

		const federatedUser = await this.internalUserAdapter.getFederatedUserByInternalId(internalUserId);
		if (!federatedUser) {
			return;
		}

		await this.bridge.leaveRoom(federatedRoom.externalId, federatedUser.externalId);
	}

	public async onUserRemovedFromRoom(afterLeaveRoomInput: FederationAfterRemoveUserFromRoomDto): Promise<void> {
		const { internalRoomId, internalUserId, actionDoneByInternalId } = afterLeaveRoomInput;

		const federatedRoom = await this.internalRoomAdapter.getFederatedRoomByInternalId(internalRoomId);
		if (!federatedRoom) {
			return;
		}

		const federatedUser = await this.internalUserAdapter.getFederatedUserByInternalId(internalUserId);
		if (!federatedUser) {
			return;
		}

		const byWhom = await this.internalUserAdapter.getFederatedUserByInternalId(actionDoneByInternalId as string);
		if (!byWhom) {
			return;
		}
		await this.bridge.kickUserFromRoom(federatedRoom.externalId, federatedUser.externalId, byWhom.externalId);
	}

	public async sendExternalMessage(roomSendExternalMessageInput: FederationRoomSendExternalMessageDto): Promise<IMessage> {
		const { internalRoomId, internalSenderId, message } = roomSendExternalMessageInput;

		const federatedSender = await this.internalUserAdapter.getFederatedUserByInternalId(internalSenderId);
		if (!federatedSender) {
			throw new Error(`Could not find user id for ${internalSenderId}`);
		}

		const federatedRoom = await this.internalRoomAdapter.getFederatedRoomByInternalId(internalRoomId);
		if (!federatedRoom) {
			throw new Error(`Could not find room id for ${internalRoomId}`);
		}
		await this.bridge.sendMessage(federatedRoom.externalId, federatedSender.externalId, message.msg);

		return message; // this need to be here due to a limitation in the internal API that was expecting the return of the sendMessage function.
	}

}
