import Ajv from 'ajv';

const ajv = new Ajv();

export type ChannelsCloseProps = { roomId: string; roomName?: string } | { roomId?: string; roomName: string };

const ChannelsClosePropsSchema = {
	type: 'object',
	properties: {
		roomId: { type: 'string' },
		roomName: { type: 'string' },
	},
	anyOf: [{ required: ['roomId'] }, { required: ['roomName'] }],
	additionalProperties: false,
};

export const isChannelsCloseProps = ajv.compile<ChannelsCloseProps>(ChannelsClosePropsSchema);
