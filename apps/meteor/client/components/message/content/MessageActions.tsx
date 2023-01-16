import type { IMessage } from '@rocket.chat/core-typings';
import type { IconProps } from '@rocket.chat/fuselage';
import { Box, ButtonGroup } from '@rocket.chat/fuselage';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import { useMessageContext } from '../MessageContext';
import MessageAction from './actions/MessageAction';

type MessageActionOptions = {
	icon: IconProps['name'];
	i18nLabel?: TranslationKey;
	label?: string;
	methodId: string;
	runAction?: (action: string) => () => void;
	actionLinksAlignment?: string;
};

type MessageActionsProps = {
	message: IMessage;
	actions: MessageActionOptions[];
};

const MessageActions = ({ message, actions }: MessageActionsProps): ReactElement => {
	const {
		actions: { runActionLink },
	} = useMessageContext();

	const alignment = actions[0]?.actionLinksAlignment || 'center';

	return (
		<Box display='flex' mb={4} mi={-4} width='full' justifyContent={alignment}>
			<ButtonGroup align='center'>
				{actions.map((action, key) => (
					<MessageAction runAction={runActionLink(message)} key={key} {...action} />
				))}
			</ButtonGroup>
		</Box>
	);
};

export default MessageActions;
