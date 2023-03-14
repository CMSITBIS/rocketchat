import type {
	AtLeast,
	ICreatedRoom,
	IInstanceStatus,
	IMessage,
	IPermission,
	IRoom,
	IMessageSearchProvider,
	IMessageSearchSuggestion,
	ISetting,
	ISubscription,
	IUser,
	RoomType,
} from '@rocket.chat/core-typings';

import type { TranslationKey } from '../TranslationContext';
import type { GetWebdavFileList, GetWebdavFilePreview, GetFileFromWebdav } from './methods/webdav';
import type { FollowMessageMethod } from './methods/followMessage';
import type { GetReadReceiptsMethod } from './methods/getReadReceipts';
import type { JoinRoomMethod } from './methods/joinRoom';
import type { UnsubscribeMethod as MailerUnsubscribeMethod } from './methods/mailer/unsubscribe';
import type { RoomNameExistsMethod } from './methods/roomNameExists';
import type { SaveRoomSettingsMethod } from './methods/saveRoomSettings';
import type { SaveSettingsMethod } from './methods/saveSettings';
import type { SaveUserPreferencesMethod } from './methods/saveUserPreferences';
import type { UnfollowMessageMethod } from './methods/message/unfollowMessage';
import type { ReportMessageMethod } from './methods/message/reportMessage';

// TODO: frontend chapter day - define methods

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ServerMethods {
	'addOAuthService': (...args: any[]) => any;
	'addUsersToRoom': (...args: any[]) => any;
	'bbbEnd': (...args: any[]) => any;
	'bbbJoin': (...args: any[]) => any;
	'blockUser': (...args: any[]) => any;
	'checkUsernameAvailability': (...args: any[]) => any;
	'cleanRoomHistory': (...args: any[]) => any;
	'clearIntegrationHistory': (...args: any[]) => any;
	'createDirectMessage': (...usernames: Exclude<IUser['username'], undefined>[]) => ICreatedRoom;
	'deleteCustomSound': (...args: any[]) => any;
	'deleteCustomUserStatus': (...args: any[]) => any;
	'deleteFileMessage': (...args: any[]) => any;
	'deleteMessage': ({ _id }: Pick<IMessage, '_id'>) => void;
	'deleteUserOwnAccount': (...args: any[]) => any;
	'e2e.resetOwnE2EKey': (...args: any[]) => any;
	'eraseRoom': (...args: any[]) => any;
	'followMessage': FollowMessageMethod;
	'getAvatarSuggestion': (...args: any[]) => any;
	'getFileFromWebdav': GetFileFromWebdav;
	'getMessages': (messages: IMessage['_id'][]) => IMessage[];
	'getRoomByTypeAndName': (
		type: RoomType,
		name: string,
	) => Pick<
		IRoom,
		| '_id'
		| 'name'
		| 'fname'
		| 't'
		| 'cl'
		| 'u'
		| 'lm'
		| 'teamId'
		| 'teamMain'
		| 'topic'
		| 'announcement'
		| 'announcementDetails'
		| 'muted'
		| 'unmuted'
		| '_updatedAt'
		| 'archived'
		| 'description'
		| 'default'
		| 'lastMessage'
		| 'prid'
		| 'avatarETag'
		| 'usersCount'
		| 'msgs'
		| 'open'
		| 'ro'
		| 'reactWhenReadOnly'
		| 'sysMes'
		| 'streamingOptions'
		| 'broadcast'
		| 'encrypted'
		| 'e2eKeyId'
		| 'servedBy'
		| 'ts'
		| 'federated'
		| 'usernames'
		| 'uids'
	>;
	'getRoomRoles': (rid: IRoom['_id']) => ISubscription[];
	'getSetupWizardParameters': () => {
		settings: ISetting[];
		serverAlreadyRegistered: boolean;
		hasAdmin: boolean;
	};
	'getSingleMessage': (mid: IMessage['_id']) => IMessage;
	'getThreadMessages': (params: { tmid: IMessage['_id'] }) => IMessage[];
	'getUsersOfRoom': (...args: any[]) => any;
	'getWebdavFileList': GetWebdavFileList;
	'getWebdavFilePreview': GetWebdavFilePreview;
	'hideRoom': (...args: any[]) => any;
	'ignoreUser': (...args: any[]) => any;
	'insertOrUpdateSound': (args: { previousName?: string; name?: string; _id?: string; extension: string }) => string;
	'insertOrUpdateUserStatus': (...args: any[]) => any;
	'instances/get': () => IInstanceStatus[];
	'joinRoom': JoinRoomMethod;
	'leaveRoom': (...args: any[]) => any;
	'loadHistory': (
		rid: IRoom['_id'],
		ts?: Date,
		limit?: number,
		ls?: string,
		showThreadMessages?: boolean,
	) => {
		messages: IMessage[];
		firstUnread: IMessage;
		unreadNotLoaded: number;
	};
	'loadMissedMessages': (rid: IRoom['_id'], ts: Date) => IMessage[];
	'loadNextMessages': (
		rid: IRoom['_id'],
		end?: Date,
		limit?: number,
	) => {
		messages: IMessage[];
	};
	'loadSurroundingMessages': (
		message: Pick<IMessage, '_id' | 'rid'> & { ts?: Date },
		limit?: number,
	) =>
		| {
				messages: IMessage[];
				moreBefore: boolean;
				moreAfter: boolean;
		  }
		| false;
	'logoutCleanUp': (user: IUser) => void;
	'Mailer.sendMail': (from: string, subject: string, body: string, dryrun: boolean, query: string) => any;
	'muteUserInRoom': (...args: any[]) => any;
	'openRoom': (rid: IRoom['_id']) => ISubscription;
	'personalAccessTokens:generateToken': (...args: any[]) => any;
	'personalAccessTokens:regenerateToken': (...args: any[]) => any;
	'personalAccessTokens:removeToken': (...args: any[]) => any;
	'e2e.requestSubscriptionKeys': (...args: any[]) => any;
	'readMessages': (...args: any[]) => any;
	'readThreads': (tmid: IMessage['_id']) => void;
	'refreshOAuthService': (...args: any[]) => any;
	'registerUser': (...args: any[]) => any;
	'removeOAuthService': (...args: any[]) => any;
	'removeCannedResponse': (...args: any[]) => any;
	'replayOutgoingIntegration': (...args: any[]) => any;
	'reportMessage': ReportMessageMethod;
	'requestDataDownload': (...args: any[]) => any;
	'resetPassword': (...args: any[]) => any;
	'roomNameExists': RoomNameExistsMethod;
	'saveCannedResponse': (...args: any[]) => any;
	'saveRoomSettings': SaveRoomSettingsMethod;
	'saveSettings': SaveSettingsMethod;
	'saveUserPreferences': SaveUserPreferencesMethod;
	'saveUserProfile': (...args: any[]) => any;
	'sendConfirmationEmail': (...args: any[]) => any;
	'sendMessage': (message: AtLeast<IMessage, '_id' | 'rid' | 'msg'>) => any;
	'setAdminStatus': (...args: any[]) => any;
	'setAvatarFromService': (...args: any[]) => any;
	'setReaction': (reaction: string, mid: IMessage['_id']) => void;
	'setUsername': (...args: any[]) => any;
	'setUserPassword': (...args: any[]) => any;
	'setUserStatus': (statusType: IUser['status'], statusText: IUser['statusText']) => void;
	'slashCommand': (params: { cmd: string; params: string; msg: IMessage; triggerId: string }) => unknown;
	'toggleFavorite': (...args: any[]) => any;
	'unblockUser': (...args: any[]) => any;
	'unfollowMessage': UnfollowMessageMethod;
	'unmuteUserInRoom': (...args: any[]) => any;
	'unreadMessages': (...args: any[]) => any;
	'updateIncomingIntegration': (...args: any[]) => any;
	'updateOutgoingIntegration': (...args: any[]) => any;
	'uploadCustomSound': (...args: any[]) => any;
	'Mailer:unsubscribe': MailerUnsubscribeMethod;
	'getRoomById': (rid: IRoom['_id']) => IRoom;
	'getReadReceipts': GetReadReceiptsMethod;
	'checkRegistrationSecretURL': (hash: string) => boolean;
	'livechat:changeLivechatStatus': (params?: void | { status?: string; agentId?: string }) => unknown;
	'livechat:saveAgentInfo': (_id: string, agentData: unknown, agentDepartments: unknown) => unknown;
	'livechat:takeInquiry': (inquiryId: string, options?: { clientAction: boolean; forwardingToDepartment?: boolean }) => unknown;
	'livechat:resumeOnHold': (roomId: string, options?: { clientAction: boolean }) => unknown;
	'spotlight': (
		...args: (
			| string
			| string[]
			| {
					users?: boolean;
					rooms?: boolean;
					mentions?: boolean;
			  }
		)[]
	) => {
		rooms: { _id: string; name: string; t: string; uids?: string[] }[];
		users: {
			_id: string;
			status: 'offline' | 'online' | 'busy' | 'away';
			name: string;
			username: string;
			outside: boolean;
			avatarETag?: string;
			nickname?: string;
		}[];
	};
	'getPasswordPolicy': (params?: { token: string }) => {
		enabled: boolean;
		policy: [name: TranslationKey, options?: Record<string, unknown>][];
	};
	'rooms/get': (updatedSince?: Date) => IRoom[] | { update: IRoom[]; remove: IRoom[] };
	'subscriptions/get': (updatedSince?: Date) => ISubscription[] | { update: ISubscription[]; remove: ISubscription[] };
	'permissions/get': (updatedSince?: Date) => IPermission[] | { update: IPermission[]; remove: IPermission[] };
	'public-settings/get': (updatedSince?: Date) => ISetting[] | { update: ISetting[]; remove: ISetting[] };
	'private-settings/get': (updatedSince?: Date) => ISetting[] | { update: ISetting[]; remove: ISetting[] };
	'pinMessage': (message: IMessage) => void;
	'unpinMessage': (message: IMessage) => void;
	'rocketchatSearch.getProvider': () => IMessageSearchProvider | undefined;
	'rocketchatSearch.search': (
		text: string,
		context: { uid?: IUser['_id']; rid: IRoom['_id'] },
		payload: unknown,
	) => {
		message: {
			docs: IMessage[];
		};
	};
	'rocketchatSearch.suggest': (
		text: string,
		context: { uid?: IUser['_id']; rid: IRoom['_id'] },
		payload: unknown,
	) => IMessageSearchSuggestion[];
}

export type ServerMethodName = keyof ServerMethods;

export type ServerMethodParameters<MethodName extends ServerMethodName> = Parameters<ServerMethods[MethodName]>;

export type ServerMethodReturn<MethodName extends ServerMethodName> = Awaited<ReturnType<ServerMethods[MethodName]>>;

export type ServerMethodFunction<MethodName extends ServerMethodName> = (
	...args: ServerMethodParameters<MethodName>
) => Promise<ServerMethodReturn<MethodName>>;
