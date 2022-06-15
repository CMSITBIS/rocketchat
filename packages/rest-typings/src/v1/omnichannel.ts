import type {
	IOmnichannelCannedResponse,
	ILivechatAgent,
	ILivechatDepartment,
	ILivechatDepartmentRecord,
	ILivechatDepartmentAgents,
	ILivechatMonitor,
	ILivechatTag,
	ILivechatVisitor,
	ILivechatVisitorDTO,
	IMessage,
	IOmnichannelRoom,
	IRoom,
	ISetting,
} from '@rocket.chat/core-typings';
import Ajv from 'ajv';

import type { PaginatedRequest } from '../helpers/PaginatedRequest';
import type { PaginatedResult } from '../helpers/PaginatedResult';

type booleanString = 'true' | 'false';

const ajv = new Ajv({
	coerceTypes: true,
});

type LivechatVisitorsInfo = {
	visitorId: string;
};

const LivechatVisitorsInfoSchema = {
	type: 'object',
	properties: {
		visitorId: {
			type: 'string',
		},
	},
	required: ['visitorId'],
	additionalProperties: false,
};

export const isLivechatVisitorsInfoProps = ajv.compile<LivechatVisitorsInfo>(LivechatVisitorsInfoSchema);

type LivechatRoomOnHold = {
	roomId: IRoom['_id'];
};

const LivechatRoomOnHoldSchema = {
	type: 'object',
	properties: {
		roomId: {
			type: 'string',
		},
	},
	required: ['roomId'],
	additionalProperties: false,
};

export const isLivechatRoomOnHoldProps = ajv.compile<LivechatRoomOnHold>(LivechatRoomOnHoldSchema);

type LivechatDepartmentId = {
	onlyMyDepartments?: booleanString;
	includeAgents?: booleanString;
};

const LivechatDepartmentIdSchema = {
	type: 'object',
	properties: {
		onlyMyDepartments: {
			type: 'string',
			nullable: true,
		},
		includeAgents: {
			type: 'string',
			nullable: true,
		},
	},
	additionalProperties: false,
};

export const isLivechatDepartmentIdProps = ajv.compile<LivechatDepartmentId>(LivechatDepartmentIdSchema);

type LivechatDepartmentAutocomplete = {
	selector: string;
	onlyMyDepartments: booleanString;
};

const LivechatDepartmentAutocompleteSchema = {
	type: 'object',
	properties: {
		selector: {
			type: 'string',
		},
		onlyMyDepartments: {
			type: 'string',
		},
	},
	required: ['selector', 'onlyMyDepartments'],
	additionalProperties: false,
};

export const isLivechatDepartmentAutocompleteProps = ajv.compile<LivechatDepartmentAutocomplete>(LivechatDepartmentAutocompleteSchema);

type LivechatDepartmentDepartmentIdAgentsGET = {
	sort: string;
};

const LivechatDepartmentDepartmentIdAgentsGETSchema = {
	type: 'object',
	properties: {
		sort: {
			type: 'string',
		},
	},
	required: ['sort'],
	additionalProperties: false,
};

export const isLivechatDepartmentDepartmentIdAgentsGETProps = ajv.compile<LivechatDepartmentDepartmentIdAgentsGET>(
	LivechatDepartmentDepartmentIdAgentsGETSchema,
);

type LivechatDepartmentDepartmentIdAgentsPOST = {
	upsert: string[];
	remove: string[];
};

const LivechatDepartmentDepartmentIdAgentsPOSTSchema = {
	type: 'object',
	properties: {
		upsert: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		remove: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
	},
	required: ['upsert', 'remove'],
	additionalProperties: false,
};

export const isLivechatDepartmentDepartmentIdAgentsPOSTProps = ajv.compile<LivechatDepartmentDepartmentIdAgentsPOST>(
	LivechatDepartmentDepartmentIdAgentsPOSTSchema,
);

type LivechatVisitorTokenGet = {
	token: string;
};

const LivechatVisitorTokenGetSchema = {
	type: 'object',
	properties: {
		token: {
			type: 'string',
		},
	},
	required: ['token'],
	additionalProperties: false,
};

export const isLivechatVisitorTokenGetProps = ajv.compile<LivechatVisitorTokenGet>(LivechatVisitorTokenGetSchema);

type LivechatVisitorTokenDelete = {
	token: string;
};

const LivechatVisitorTokenDeleteSchema = {
	type: 'object',
	properties: {
		token: {
			type: 'string',
		},
	},
	required: ['token'],
	additionalProperties: false,
};

export const isLivechatVisitorTokenDeleteProps = ajv.compile<LivechatVisitorTokenDelete>(LivechatVisitorTokenDeleteSchema);

type LivechatVisitorTokenRoom = {
	token: string;
};

const LivechatVisitorTokenRoomSchema = {
	type: 'object',
	properties: {
		token: {
			type: 'string',
		},
	},
	required: ['token'],
	additionalProperties: false,
};

export const isLivechatVisitorTokenRoomProps = ajv.compile<LivechatVisitorTokenRoom>(LivechatVisitorTokenRoomSchema);

type LivechatVisitorCallStatus = {
	token: string;
	callStatus: string;
	rid: string;
	callId: string;
};

const LivechatVisitorCallStatusSchema = {
	type: 'object',
	properties: {
		token: {
			type: 'string',
		},
		callStatus: {
			type: 'string',
		},
		rid: {
			type: 'string',
		},
		callId: {
			type: 'string',
		},
	},
	required: ['token', 'callStatus', 'rid', 'callId'],
	additionalProperties: false,
};

export const isLivechatVisitorCallStatusProps = ajv.compile<LivechatVisitorCallStatus>(LivechatVisitorCallStatusSchema);

type LivechatVisitorStatus = {
	token: string;
	status: string;
};

const LivechatVisitorStatusSchema = {
	type: 'object',
	properties: {
		token: {
			type: 'string',
		},
		status: {
			type: 'string',
		},
	},
	required: ['token', 'status'],
	additionalProperties: false,
};

export const isLivechatVisitorStatusProps = ajv.compile<LivechatVisitorStatus>(LivechatVisitorStatusSchema);

type LiveChatRoomJoin = {
	roomId: string;
};

const LiveChatRoomJoinSchema = {
	type: 'object',
	properties: {
		roomId: {
			type: 'string',
		},
	},
	required: ['roomId'],
	additionalProperties: false,
};

export const isLiveChatRoomJoinProps = ajv.compile<LiveChatRoomJoin>(LiveChatRoomJoinSchema);

type LivechatMonitorsListProps = PaginatedRequest<{ text: string }>;

const LivechatMonitorsListSchema = {
	type: 'object',
	properties: {
		text: {
			type: 'string',
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	required: ['text'],
	additionalProperties: false,
};

export const isLivechatMonitorsListProps = ajv.compile<LivechatMonitorsListProps>(LivechatMonitorsListSchema);

type LivechatTagsListProps = PaginatedRequest<{ text: string }, 'name'>;

const LivechatTagsListSchema = {
	type: 'object',
	properties: {
		text: {
			type: 'string',
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	required: ['text'],
	additionalProperties: false,
};

export const isLivechatTagsListProps = ajv.compile<LivechatTagsListProps>(LivechatTagsListSchema);

type LivechatDepartmentProps = PaginatedRequest<{
	text: string;
	onlyMyDepartments?: booleanString;
	enabled?: booleanString;
	excludeDepartmentId?: string;
}>;

const LivechatDepartmentSchema = {
	type: 'object',
	properties: {
		text: {
			type: 'string',
			nullable: true,
		},
		onlyMyDepartments: {
			type: 'string',
			enum: ['true', 'false'],
			nullable: true,
		},
		enabled: {
			type: 'string',
			nullable: true,
		},
		excludeDepartmentId: {
			type: 'string',
			nullable: true,
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
		fields: {
			type: 'string',
			nullable: true,
		},
	},
	additionalProperties: false,
};

export const isLivechatDepartmentProps = ajv.compile<LivechatDepartmentProps>(LivechatDepartmentSchema);

type LivechatDepartmentsAvailableByUnitIdProps = PaginatedRequest<{ text: string; onlyMyDepartments?: 'true' | 'false' }>;

const LivechatDepartmentsAvailableByUnitIdSchema = {
	type: 'object',
	properties: {
		text: {
			type: 'string',
		},
		onlyMyDepartments: {
			type: 'string',
			enum: ['true', 'false'],
			nullable: true,
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	required: ['text'],
	additionalProperties: false,
};

export const isLivechatDepartmentsAvailableByUnitIdProps = ajv.compile<LivechatDepartmentsAvailableByUnitIdProps>(
	LivechatDepartmentsAvailableByUnitIdSchema,
);

type LivechatDepartmentsByUnitProps = PaginatedRequest<{ text: string }>;

const LivechatDepartmentsByUnitSchema = {
	type: 'object',
	properties: {
		text: {
			type: 'string',
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	required: ['text'],
	additionalProperties: false,
};

export const isLivechatDepartmentsByUnitProps = ajv.compile<LivechatDepartmentsByUnitProps>(LivechatDepartmentsByUnitSchema);

type LivechatDepartmentsByUnitIdProps = PaginatedRequest<{}>;

const LivechatDepartmentsByUnitIdSchema = {
	type: 'object',
	properties: {
		text: {
			type: 'string',
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	required: ['text'],
	additionalProperties: false,
};

export const isLivechatDepartmentsByUnitIdProps = ajv.compile<LivechatDepartmentsByUnitIdProps>(LivechatDepartmentsByUnitIdSchema);

type LivechatUsersManagerGETProps = PaginatedRequest<{ text?: string }>;

const LivechatUsersManagerGETSchema = {
	type: 'object',
	properties: {
		text: {
			type: 'string',
			nullable: true,
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	required: [],
	additionalProperties: false,
};

export const isLivechatUsersManagerGETProps = ajv.compile<LivechatUsersManagerGETProps>(LivechatUsersManagerGETSchema);

type LivechatUsersManagerPOSTProps = PaginatedRequest<{ username: string }>;

const LivechatUsersManagerPOSTSchema = {
	type: 'object',
	properties: {
		username: {
			type: 'string',
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	required: ['username'],
	additionalProperties: false,
};

export const isLivechatUsersManagerPOSTProps = ajv.compile<LivechatUsersManagerPOSTProps>(LivechatUsersManagerPOSTSchema);

type LivechatQueueProps = {
	agentId?: string;
	includeOfflineAgents?: booleanString;
	departmentId?: string;
	offset: number;
	count: number;
	sort: string;
};

const LivechatQueuePropsSchema = {
	type: 'object',
	properties: {
		agentId: {
			type: 'string',
			nullable: true,
		},
		includeOfflineAgents: {
			type: 'string',
			nullable: true,
		},
		departmentId: {
			type: 'string',
			nullable: true,
		},
		count: {
			type: 'number',
		},
		offset: {
			type: 'number',
		},
		sort: {
			type: 'string',
		},
	},
	required: ['count', 'offset', 'sort'],
	additionalProperties: false,
};

export const isLivechatQueueProps = ajv.compile<LivechatQueueProps>(LivechatQueuePropsSchema);

type CannedResponsesProps = PaginatedRequest<{
	scope?: string;
	departmentId?: string;
	text?: string;
}>;

const CannedResponsesPropsSchema = {
	type: 'object',
	properties: {
		scope: {
			type: 'string',
			nullable: true,
		},
		departmentId: {
			type: 'string',
			nullable: true,
		},
		text: {
			type: 'string',
			nullable: true,
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	additionalProperties: false,
};

export const isCannedResponsesProps = ajv.compile<CannedResponsesProps>(CannedResponsesPropsSchema);

type LivechatCustomFieldsProps = PaginatedRequest<{ text: string }>;

const LivechatCustomFieldsSchema = {
	type: 'object',
	properties: {
		text: {
			type: 'string',
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	required: ['text'],
	additionalProperties: false,
};

export const isLivechatCustomFieldsProps = ajv.compile<LivechatCustomFieldsProps>(LivechatCustomFieldsSchema);

type LivechatRoomsProps = {
	guest: string;
	fname: string;
	servedBy: string[];
	status: string;
	department: string;
	from: string;
	to: string;
	customFields: any;
	current: number;
	itemsPerPage: number;
	tags: string[];
};

const LivechatRoomsSchema = {
	type: 'object',
	properties: {
		guest: {
			type: 'string',
		},
		fname: {
			type: 'string',
		},
		servedBy: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		status: {
			type: 'string',
		},
		department: {
			type: 'string',
		},
		from: {
			type: 'string',
		},
		to: {
			type: 'string',
		},
		customFields: {
			type: 'object',
			nullable: true,
		},
		current: {
			type: 'number',
		},
		itemsPerPage: {
			type: 'number',
		},
		tags: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
	},
	required: ['guest', 'fname', 'servedBy', 'status', 'department', 'from', 'to', 'current', 'itemsPerPage'],
	additionalProperties: false,
};

export const isLivechatRoomsProps = ajv.compile<LivechatRoomsProps>(LivechatRoomsSchema);

type LivechatRidMessagesProps = PaginatedRequest<{ query: string }>;

const LivechatRidMessagesSchema = {
	type: 'object',
	properties: {
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
		},
	},
	required: ['query'],
	additionalProperties: false,
};

export const isLivechatRidMessagesProps = ajv.compile<LivechatRidMessagesProps>(LivechatRidMessagesSchema);

type LivechatUsersAgentProps = PaginatedRequest<{ text?: string }>;

const LivechatUsersAgentSchema = {
	type: 'object',
	properties: {
		text: {
			type: 'string',
			nullable: true,
		},
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	required: [],
	additionalProperties: false,
};

export const isLivechatUsersAgentProps = ajv.compile<LivechatUsersAgentProps>(LivechatUsersAgentSchema);

export type OmnichannelEndpoints = {
	'/v1/livechat/appearance': {
		GET: () => {
			appearance: ISetting[];
		};
	};
	'/v1/livechat/visitors.info': {
		GET: (params: LivechatVisitorsInfo) => {
			visitor: {
				visitorEmails: Array<{
					address: string;
				}>;
			};
		};
	};
	'/v1/livechat/room': {
		GET: (params: { token: string; rid: IRoom['_id'] }) => {
			room: IOmnichannelRoom;
		};
	};
	'/v1/livechat/room.onHold': {
		POST: (params: LivechatRoomOnHold) => void;
	};
	'/v1/livechat/room.join': {
		GET: (params: LiveChatRoomJoin) => { success: boolean };
	};
	'/v1/livechat/monitors': {
		GET: (params: LivechatMonitorsListProps) => PaginatedResult<{
			monitors: ILivechatMonitor[];
		}>;
	};
	'/v1/livechat/monitors/:username': {
		GET: () => ILivechatMonitor;
	};
	'/v1/livechat/tags.list': {
		GET: (params: LivechatTagsListProps) => PaginatedResult<{
			tags: ILivechatTag[];
		}>;
	};
	'/v1/livechat/department': {
		GET: (params: LivechatDepartmentProps) => PaginatedResult<{
			departments: ILivechatDepartment[];
		}>;
		POST: (params: { department: Partial<ILivechatDepartment>; agents: string[] }) => {
			department: ILivechatDepartment;
			agents: any[];
		};
	};
	'/v1/livechat/department/:_id': {
		GET: (params: LivechatDepartmentId) => {
			department: ILivechatDepartmentRecord | null;
			agents?: ILivechatDepartmentAgents[];
		};
		PUT: (params: { department: Partial<ILivechatDepartment>[]; agents: any[] }) => {
			department: ILivechatDepartment;
			agents: ILivechatDepartmentAgents[];
		};
		DELETE: () => void;
	};
	'/v1/livechat/department.autocomplete': {
		GET: (params: LivechatDepartmentAutocomplete) => {
			items: ILivechatDepartment[];
		};
	};
	'/v1/livechat/department/:departmentId/agents': {
		GET: (params: LivechatDepartmentDepartmentIdAgentsGET) => PaginatedResult<{ agents: ILivechatDepartmentAgents[] }>;
		POST: (params: LivechatDepartmentDepartmentIdAgentsPOST) => void;
	};
	'/v1/livechat/units/:unitId/departments/available': {
		GET: (params: LivechatDepartmentsAvailableByUnitIdProps) => PaginatedResult<{
			departments: ILivechatDepartment[];
		}>;
	};
	'/v1/livechat/departments.by-unit/': {
		GET: (params: LivechatDepartmentsByUnitProps) => PaginatedResult<{
			departments: ILivechatDepartment[];
		}>;
	};

	'/v1/livechat/units/:unitId/departments': {
		GET: (params: LivechatDepartmentsByUnitIdProps) => PaginatedResult<{
			departments: ILivechatDepartment[];
		}>;
	};

	'/v1/livechat/department.listByIds': {
		GET: (params: { ids: string[]; fields?: Record<string, unknown> }) => {
			departments: ILivechatDepartment[];
		};
	};

	'/v1/livechat/custom-fields': {
		GET: (params: LivechatCustomFieldsProps) => PaginatedResult<{
			customFields: [
				{
					_id: string;
					label: string;
				},
			];
		}>;
	};
	'/v1/livechat/rooms': {
		GET: (params: LivechatRoomsProps) => PaginatedResult<{
			rooms: IOmnichannelRoom[];
		}>;
	};
	'/v1/livechat/:rid/messages': {
		GET: (params: LivechatRidMessagesProps) => PaginatedResult<{
			messages: IMessage[];
		}>;
	};

	'/v1/livechat/users/manager': {
		GET: (params: LivechatUsersManagerGETProps) => PaginatedResult<{
			users: ILivechatAgent[];
		}>;
		POST: (params: { username: string }) => { success: boolean };
	};

	'/v1/livechat/users/manager/:_id': {
		GET: (
			params: PaginatedRequest<{
				text: string;
			}>,
		) => { user: ILivechatAgent };
		DELETE: () => void;
	};

	'/v1/livechat/users/agent': {
		GET: (params: PaginatedRequest<{ text?: string }>) => PaginatedResult<{
			users: ILivechatAgent[];
		}>;
		POST: (params: LivechatUsersManagerPOSTProps) => { success: boolean };
	};

	'/v1/livechat/users/agent/:_id': {
		GET: (
			params: PaginatedRequest<{
				text: string;
			}>,
		) => { user: Pick<ILivechatAgent, '_id' | 'username' | 'name' | 'status' | 'statusLivechat' | 'emails' | 'livechat'> };
		DELETE: () => { success: boolean };
	};

	'/v1/livechat/visitor': {
		POST: (params: { visitor: ILivechatVisitorDTO }) => {
			visitor: ILivechatVisitor;
		};
	};

	'/v1/livechat/visitor/:token': {
		GET: (params: LivechatVisitorTokenGet) => { visitor: ILivechatVisitor };
		DELETE: (params: LivechatVisitorTokenDelete) => {
			visitor: { _id: string; ts: string };
		};
	};

	'/v1/livechat/visitor/:token/room': {
		GET: (params: LivechatVisitorTokenRoom) => { rooms: IOmnichannelRoom[] };
	};

	'/v1/livechat/visitor.callStatus': {
		POST: (params: LivechatVisitorCallStatus) => {
			token: string;
			callStatus: string;
		};
	};

	'/v1/livechat/visitor.status': {
		POST: (params: LivechatVisitorStatus) => {
			token: string;
			status: string;
		};
	};

	'/v1/livechat/queue': {
		GET: (params: LivechatQueueProps) => {
			queue: {
				chats: number;
				department: { _id: string; name: string };
				user: { _id: string; username: string; status: string };
			}[];
			count: number;
			offset: number;
			total: number;
		};
	};
	'/v1/livechat/agents/:uid/departments': {
		GET: (params: { enableDepartmentsOnly: 'true' | 'false' | '0' | '1' }) => { departments: ILivechatDepartmentAgents[] };
	};

	'/v1/canned-responses': {
		GET: (params: CannedResponsesProps) => PaginatedResult<{
			cannedResponses: IOmnichannelCannedResponse[];
		}>;
	};

	'/v1/livechat/webrtc.call': {
		GET: (params: { rid: string }) => void;
	};

	'/v1/livechat/webrtc.call/:callId': {
		PUT: (params: { rid: string; status: 'ended' }) => void;
	};
};
