/* eslint-disable complexity */
import type { IMessage, ISubscription } from '@rocket.chat/core-typings';
import { Button, Tag, Box } from '@rocket.chat/fuselage';
import { useContentBoxSize, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import {
	MessageComposerAction,
	MessageComposerToolbarActions,
	MessageComposer,
	MessageComposerInput,
	MessageComposerToolbar,
	MessageComposerActionsDivider,
	MessageComposerToolbarSubmit,
} from '@rocket.chat/ui-composer';
import { useTranslation, useUserPreference, useLayout, useQuill } from '@rocket.chat/ui-contexts';
import { useMutation } from '@tanstack/react-query';
import type { ReactElement, MouseEventHandler, KeyboardEventHandler, KeyboardEvent, Ref, ClipboardEventHandler } from 'react';
import React, { memo, useRef, useCallback, useState } from 'react';
import { useSubscription } from 'use-subscription';

import { createComposerAPI } from '../../../../../app/ui-message/client/messageBox/createComposerAPI';
import type { FormattingButton } from '../../../../../app/ui-message/client/messageBox/messageBoxFormatting';
import { formattingButtons } from '../../../../../app/ui-message/client/messageBox/messageBoxFormatting';
import ComposerBoxPopup from '../../../../../app/ui-message/client/popup/ComposerBoxPopup';
import ComposerBoxPopupPreview from '../../../../../app/ui-message/client/popup/components/composerBoxPopupPreview/ComposerBoxPopupPreview';
import { useComposerBoxPopup } from '../../../../../app/ui-message/client/popup/hooks/useComposerBoxPopup';
import { useEnablePopupPreview } from '../../../../../app/ui-message/client/popup/hooks/useEnablePopupPreview';
import { getImageExtensionFromMime } from '../../../../../lib/getImageExtensionFromMime';
import { useFormatDateAndTime } from '../../../../hooks/useFormatDateAndTime';
import { useReactiveValue } from '../../../../hooks/useReactiveValue';
import { roomCoordinator } from '../../../../lib/rooms/roomCoordinator';
import { keyCodes } from '../../../../lib/utils/keyCodes';
import AudioMessageRecorder from '../../../composer/AudioMessageRecorder';
import VideoMessageRecorder from '../../../composer/VideoMessageRecorder';
import { useChat } from '../../contexts/ChatContext';
import { useComposerPopup } from '../../contexts/ComposerPopupContext';
import { useRoom } from '../../contexts/RoomContext';
import ComposerUserActionIndicator from '../ComposerUserActionIndicator';
import { useAutoGrow } from '../RoomComposer/hooks/useAutoGrow';
import { useMessageComposerMergedRefs } from '../hooks/useMessageComposerMergedRefs';
import MessageBoxActionsToolbar from './MessageBoxActionsToolbar';
import MessageBoxFormattingToolbar from './MessageBoxFormattingToolbar';
import MessageBoxReplies from './MessageBoxReplies';
import { useMessageBoxAutoFocus } from './hooks/useMessageBoxAutoFocus';
import { useMessageBoxPlaceholder } from './hooks/useMessageBoxPlaceholder';
import 'quill/dist/quill.snow.css';

const handleFormattingShortcut = (
	event: KeyboardEvent<HTMLTextAreaElement>,
	formattingButtons: FormattingButton[],
	// composer: ComposerAPI,
) => {
	const isMacOS = navigator.platform.indexOf('Mac') !== -1;
	const isCmdOrCtrlPressed = (isMacOS && event.metaKey) || (!isMacOS && event.ctrlKey);

	if (!isCmdOrCtrlPressed) {
		return false;
	}

	const key = event.key.toLowerCase();

	const formatter = formattingButtons.find((formatter) => 'command' in formatter && formatter.command === key);

	if (!formatter || !('pattern' in formatter)) {
		return false;
	}

	return true;
};

const emptySubscribe = () => () => undefined;
const getEmptyFalse = () => false;
const a: any[] = [];
const getEmptyArray = () => a;

type MessageBoxProps = {
	tmid?: IMessage['_id'];
	readOnly: boolean;
	onSend?: (params: { value: string; tshow?: boolean; previewUrls?: string[] }) => Promise<void>;
	onJoin?: () => Promise<void>;
	onResize?: () => void;
	onTyping?: () => void;
	onEscape?: () => void;
	onNavigateToPreviousMessage?: () => void;
	onNavigateToNextMessage?: () => void;
	onUploadFiles?: (files: readonly File[]) => void;
	tshow?: IMessage['tshow'];
	previewUrls?: string[];
	subscription?: ISubscription;
	showFormattingTips: boolean;
	isEmbedded?: boolean;
};

const MessageBox = ({
	tmid,
	onSend,
	onJoin,
	onNavigateToNextMessage,
	onNavigateToPreviousMessage,
	onUploadFiles,
	onEscape,
	onTyping,
	readOnly,
	tshow,
	previewUrls,
}: MessageBoxProps): ReactElement => {
	const chat = useChat();
	const room = useRoom();
	const t = useTranslation();
	const composerPlaceholder = useMessageBoxPlaceholder(t('Message'), room);

	const [typing, setTyping] = useState(false);

	const { isMobile } = useLayout();
	const sendOnEnterBehavior = useUserPreference<'normal' | 'alternative' | 'desktop'>('sendOnEnter') || isMobile;
	const sendOnEnter = sendOnEnterBehavior == null || sendOnEnterBehavior === 'normal' || (sendOnEnterBehavior === 'desktop' && !isMobile);

	if (!chat) {
		throw new Error('Chat context not found');
	}

	const { quillRef, quill } = useQuill();

	quill?.on('text-change', () => {
		setTyping(quill.root.innerText.length !== 0 && quill.root.innerText !== '\n');
	});

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const messageComposerRef = useRef<HTMLElement>(null);
	const shadowRef = useRef(null);

	const storageID = `${room._id}${tmid ? `-${tmid}` : ''}`;

	const callbackRef = useCallback(
		(node: any) => {
			if (node === null) {
				return;
			}
			chat.setComposerAPI(createComposerAPI(node, storageID));
		},
		[chat, storageID],
	);

	const autofocusRef = useMessageBoxAutoFocus(!isMobile);

	const useEmojis = useUserPreference<boolean>('useEmojis');

	const handleOpenEmojiPicker: MouseEventHandler<HTMLElement> = useMutableCallback((e) => {
		e.stopPropagation();
		e.preventDefault();

		if (!useEmojis) {
			return;
		}

		const ref = messageComposerRef.current as HTMLElement;
		chat.emojiPicker.open(ref, (emoji: string) => chat.composer?.insertText(` :${emoji}: `));
	});

	const handleSendMessage = useMutableCallback(() => {
		chat.composer?.wrapSelectionV2();
		const text = chat.composer?.text ?? '';
		chat.composer?.clear();
		clearPopup();

		onSend?.({
			value: text,
			tshow,
			previewUrls,
		});
	});

	const handler: KeyboardEventHandler<HTMLTextAreaElement> = useMutableCallback((event) => {
		const { which: keyCode } = event;

		const input = event.target as any;

		const isSubmitKey = keyCode === keyCodes.CARRIAGE_RETURN || keyCode === keyCodes.NEW_LINE;

		if (isSubmitKey) {
			const withModifier = event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
			const isSending = (sendOnEnter && !withModifier) || (!sendOnEnter && withModifier);

			event.preventDefault();
			if (!isSending) {
				chat.composer?.insertNewLine();
				return false;
			}
			handleSendMessage();
			return false;
		}

		if (chat.composer && handleFormattingShortcut(event, [...formattingButtons])) {
			return;
		}

		if (event.shiftKey || event.ctrlKey || event.metaKey) {
			return;
		}

		switch (event.key) {
			case 'Escape': {
				if (chat.currentEditing) {
					event.preventDefault();
					event.stopPropagation();

					chat.currentEditing.reset().then((reset) => {
						if (!reset) {
							chat.currentEditing?.cancel();
						}
					});

					return;
				}

				if (!input.value.trim()) onEscape?.();
				return;
			}

			case 'ArrowUp': {
				if (input.selectionEnd === 0) {
					event.preventDefault();
					event.stopPropagation();

					onNavigateToPreviousMessage?.();

					if (event.altKey) {
						input.setSelectionRange(0, 0);
					}
				}

				return;
			}

			case 'ArrowDown': {
				console.log(input.selectionEnd, input.innerText.length);
				if (input.selectionEnd === input.innerText.length) {
					event.preventDefault();
					event.stopPropagation();

					onNavigateToNextMessage?.();

					if (event.altKey) {
						input.setSelectionRange(input.innerText.length, input.innerText.length);
					}
				}
			}
		}

		onTyping?.();
	});

	const isEditing = useSubscription({
		getCurrentValue: chat.composer?.editing.get ?? getEmptyFalse,
		subscribe: chat.composer?.editing.subscribe ?? emptySubscribe,
	});

	const isRecordingAudio = useSubscription({
		getCurrentValue: chat.composer?.recording.get ?? getEmptyFalse,
		subscribe: chat.composer?.recording.subscribe ?? emptySubscribe,
	});

	const isMicrophoneDenied = useSubscription({
		getCurrentValue: chat.composer?.isMicrophoneDenied.get ?? getEmptyFalse,
		subscribe: chat.composer?.isMicrophoneDenied.subscribe ?? emptySubscribe,
	});

	const isRecordingVideo = useSubscription({
		getCurrentValue: chat.composer?.recordingVideo.get ?? getEmptyFalse,
		subscribe: chat.composer?.recordingVideo.subscribe ?? emptySubscribe,
	});

	const formatters = useSubscription({
		getCurrentValue: chat.composer?.formatters.get ?? getEmptyArray,
		subscribe: chat.composer?.formatters.subscribe ?? emptySubscribe,
	});

	const isRecording = isRecordingAudio || isRecordingVideo;

	const { textAreaStyle, shadowStyle } = useAutoGrow(textareaRef, shadowRef, isRecordingAudio);

	const canSend = useReactiveValue(useCallback(() => roomCoordinator.verifyCanSendMessage(room._id), [room._id]));

	const sizes = useContentBoxSize(textareaRef);

	const format = useFormatDateAndTime();

	const joinMutation = useMutation(async () => onJoin?.());

	const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = useMutableCallback((event) => {
		const { clipboardData } = event;

		if (!clipboardData) {
			return;
		}

		const items = Array.from(clipboardData.items);

		if (items.some(({ kind, type }) => kind === 'string' && type === 'text/plain')) {
			return;
		}

		const files = items
			.filter((item) => item.kind === 'file' && item.type.indexOf('image/') !== -1)
			.map((item) => {
				const fileItem = item.getAsFile();

				if (!fileItem) {
					return;
				}

				const imageExtension = fileItem ? getImageExtensionFromMime(fileItem.type) : undefined;

				const extension = imageExtension ? `.${imageExtension}` : '';

				Object.defineProperty(fileItem, 'name', {
					writable: true,
					value: `Clipboard - ${format(new Date())}${extension}`,
				});
				return fileItem;
			})
			.filter((file): file is File => !!file);

		if (files.length) {
			event.preventDefault();
			onUploadFiles?.(files);
		}
	});

	const composerPopupConfig = useComposerPopup();

	const {
		popup,
		focused,
		items,
		ariaActiveDescendant,
		suspended,
		select,
		clearPopup,
		commandsRef,
		callbackRef: c,
		filter,
	} = useComposerBoxPopup<{ _id: string; sort?: number }>({
		configurations: composerPopupConfig,
	});

	const mergedRefs = useMessageComposerMergedRefs(c, quillRef, callbackRef, autofocusRef);

	const shouldPopupPreview = useEnablePopupPreview(filter, popup);

	return (
		<>
			{chat.composer?.quotedMessages && <MessageBoxReplies />}

			{shouldPopupPreview && popup && (
				<ComposerBoxPopup select={select} items={items} focused={focused} title={popup.title} renderItem={popup.renderItem} />
			)}
			{/*
				SlashCommand Preview popup works in a weird way
				There is only one trigger for all the commands: "/"
				After that we need to the slashcommand list and check if the command exists and provide the preview
				if not the query is `suspend` which means the slashcommand is not found or doesn't have a preview
			*/}
			{popup?.preview && (
				<ComposerBoxPopupPreview
					select={select}
					items={items as any}
					focused={focused as any}
					renderItem={popup.renderItem}
					ref={commandsRef}
					rid={room._id}
					tmid={tmid}
					suspended={suspended}
				/>
			)}

			{readOnly && (
				<Box mbe={4} display='flex'>
					<Tag title={t('Only_people_with_permission_can_send_messages_here')}>{t('This_room_is_read_only')}</Tag>
				</Box>
			)}

			{isRecordingVideo && <VideoMessageRecorder reference={messageComposerRef} rid={room._id} tmid={tmid} />}
			<MessageComposer ref={messageComposerRef} variant={isEditing ? 'editing' : undefined}>
				{isRecordingAudio && <AudioMessageRecorder rid={room._id} isMicrophoneDenied={isMicrophoneDenied} />}
				<MessageComposerInput
					ref={mergedRefs as unknown as Ref<any>}
					aria-label={composerPlaceholder}
					name='msg'
					disabled={isRecording || !canSend}
					style={textAreaStyle}
					placeholder={composerPlaceholder}
					onKeyDown={handler}
					onPaste={handlePaste}
					aria-activedescendant={ariaActiveDescendant}
				/>
				<div ref={shadowRef} style={shadowStyle} />
				<MessageComposerToolbar>
					<MessageComposerToolbarActions aria-label={t('Message_composer_toolbox_primary_actions')}>
						<MessageComposerAction
							icon='emoji'
							disabled={!useEmojis || isRecording || !canSend}
							onClick={handleOpenEmojiPicker}
							title={t('Emoji')}
						/>
						<MessageComposerActionsDivider />
						{chat.composer && formatters.length > 0 && (
							<MessageBoxFormattingToolbar
								composer={chat.composer}
								variant={sizes.inlineSize < 480 ? 'small' : 'large'}
								items={formatters}
								disabled={isRecording || !canSend}
							/>
						)}
						<MessageComposerActionsDivider />
						<MessageBoxActionsToolbar
							variant={sizes.inlineSize < 480 ? 'small' : 'large'}
							isRecording={isRecording}
							typing={typing}
							canSend={canSend}
							rid={room._id}
							tmid={tmid}
							isMicrophoneDenied={isMicrophoneDenied}
						/>
					</MessageComposerToolbarActions>
					<MessageComposerToolbarSubmit>
						{!canSend && (
							<Button small primary onClick={onJoin} loading={joinMutation.isLoading}>
								{t('Join')}
							</Button>
						)}
						{canSend && (
							<MessageComposerAction
								aria-label={t('Send')}
								icon='send'
								disabled={!canSend || (!typing && !isEditing)}
								onClick={handleSendMessage}
								secondary={typing || isEditing}
								info={typing || isEditing}
							/>
						)}
					</MessageComposerToolbarSubmit>
				</MessageComposerToolbar>
			</MessageComposer>
			<ComposerUserActionIndicator rid={room._id} tmid={tmid} />
		</>
	);
};

export default memo(MessageBox);
