import { FileProp, MessageAttachmentBase } from '@rocket.chat/core-typings';
import React, { FC } from 'react';

import { useBlockRendered } from '../hooks/useBlockRendered';
import Item from './Item';

const Attachments: FC<{ attachments: Array<MessageAttachmentBase>; file?: FileProp; rid: string }> = ({
	attachments = null,
	file,
	rid,
}): any => {
	const { className, ref } = useBlockRendered<HTMLDivElement>();
	return (
		<>
			<div className={className} ref={ref} />
			{attachments?.map((attachment, index) => (
				<Item key={index} file={file} attachment={attachment} rid={rid} />
			))}
		</>
	);
};

export default Attachments;
