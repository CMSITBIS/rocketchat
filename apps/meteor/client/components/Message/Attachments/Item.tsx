import { isFileAttachment, FileProp, MessageAttachmentBase, isQuoteAttachment } from '@rocket.chat/core-typings';
import React, { FC, memo } from 'react';

import DefaultAttachment from './DefaultAttachment';
import { FileAttachment } from './Files';
import { QuoteAttachment } from './QuoteAttachment';

const Item: FC<{ attachment: MessageAttachmentBase; file?: FileProp | undefined; rid: string }> = ({ attachment, file, rid }) => {
	if (isFileAttachment(attachment) && file) {
		return <FileAttachment {...attachment} file={file} />;
	}

	if (isQuoteAttachment(attachment)) {
		return <QuoteAttachment {...attachment} rid={rid} />;
	}

	return <DefaultAttachment {...(attachment as any)} rid={rid} />;
};

export default memo(Item);
