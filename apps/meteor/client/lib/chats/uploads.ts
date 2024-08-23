import type { IMessage, IRoom, IE2EEMessage, IUpload } from '@rocket.chat/core-typings';
import { Emitter } from '@rocket.chat/emitter';
import { Random } from '@rocket.chat/random';

import { UserAction, USER_ACTIVITIES } from '../../../app/ui/client/lib/UserAction';
import { sdk } from '../../../app/utils/client/lib/SDKClient';
import { getErrorMessage } from '../errorHandling';
import type { UploadsAPI } from './ChatAPI';
import type { Upload } from './Upload';

let uploads: readonly Upload[] = [];

const emitter = new Emitter<{ update: void; [x: `cancelling-${Upload['id']}`]: void }>();

const updateUploads = (update: (uploads: readonly Upload[]) => readonly Upload[]): void => {
	uploads = update(uploads);
	emitter.emit('update');
};

const get = (): readonly Upload[] => uploads;

const subscribe = (callback: () => void): (() => void) => emitter.on('update', callback);

const cancel = (id: Upload['id']): void => {
	emitter.emit(`cancelling-${id}`);
};

const wipeFailedOnes = (): void => {
	updateUploads((uploads) => uploads.filter((upload) => !upload.error));
};

const send = async (
	file: File[] | File,
	{
		msg,
		rid,
		tmid,
		t,
	}: {
		msg?: string;
		rid: string;
		tmid?: string;
		t?: IMessage['t'];
	},
	getContent?: (fileId: string[], fileUrl: string[]) => Promise<IE2EEMessage['content']>,
	fileContent?: { raw: Partial<IUpload>; encrypted?: { algorithm: string; ciphertext: string } | undefined },
): Promise<void> => {
	const files = Array.isArray(file) ? file : [file];
	const id = Random.id();
	updateUploads((uploads) => [
		...uploads,
		{
			id,
			name: files[0].name || fileContent?.raw.name || 'unknown',
			percentage: 0,
		},
	]);

	const fileIds: string[] = [];
	const fileUrls: string[] = [];

	files.forEach((f) => {
		new Promise<void>((resolve, reject) => {
			const xhr = sdk.rest.upload(
				`/v1/rooms.media/${rid}`,
				{
					file: f,
					...(fileContent && {
						content: JSON.stringify(fileContent.encrypted),
					}),
				},
				{
					progress: (event) => {
						if (!event.lengthComputable) {
							return;
						}
						const progress = (event.loaded / event.total) * 100;
						if (progress === 100) {
							resolve();
						}

						updateUploads((uploads) =>
							uploads.map((upload) => {
								if (upload.id !== id) {
									return upload;
								}

								return {
									...upload,
									percentage: Math.round(progress) || 0,
								};
							}),
						);
					},
					error: (event) => {
						updateUploads((uploads) =>
							uploads.map((upload) => {
								if (upload.id !== id) {
									return upload;
								}

								return {
									...upload,
									percentage: 0,
									error: new Error(xhr.responseText),
								};
							}),
						);
						reject(event);
					},
				},
			);

			xhr.onload = async () => {
				if (xhr.readyState === xhr.DONE && xhr.status === 200) {
					const result = JSON.parse(xhr.responseText);
					fileIds.push(result.file._id);
					fileUrls.push(result.file.url);
					if (fileIds.length === files.length) {
						if (msg === undefined) {
							msg = '';
						}

						try {
							let content;
							if (getContent) {
								content = await getContent(fileIds, fileUrls);
							}
							const text: IMessage = {
								rid,
								_id: id,
								msg: msg || '',
								ts: new Date(),
								u: { _id: id, username: id },
								_updatedAt: new Date(),
								tmid,
								t,
								content,
							};
							await sdk.call('sendMessage', text, fileUrls, fileIds);

							// await sdk.rest.post(`/v1/rooms.mediaConfirm/${rid}/${fileIds[0]}`, {
							// 	msg,
							// 	tmid,
							// 	description,
							// 	t,
							// 	content,
							// });

							updateUploads((uploads) => uploads.filter((upload) => upload.id !== id));
						} catch (error) {
							updateUploads((uploads) =>
								uploads.map((upload) => {
									if (upload.id !== id) {
										return upload;
									}

									return {
										...upload,
										percentage: 0,
										error: new Error(getErrorMessage(error)),
									};
								}),
							);
						} finally {
							if (!uploads.length) {
								UserAction.stop(rid, USER_ACTIVITIES.USER_UPLOADING, { tmid });
							}
						}
					}
				}
			};

			emitter.once(`cancelling-${id}`, () => {
				xhr.abort();
				updateUploads((uploads) => uploads.filter((upload) => upload.id !== id));
				reject(new Error('Upload cancelled'));
			});
		});
	});
};

export const createUploadsAPI = ({ rid, tmid }: { rid: IRoom['_id']; tmid?: IMessage['_id'] }): UploadsAPI => ({
	get,
	subscribe,
	wipeFailedOnes,
	cancel,
	send: (
		file: File[] | File,
		{ msg, t }: { msg?: string; t?: IMessage['t'] },
		getContent?: (fileId: string[], fileUrl: string[]) => Promise<IE2EEMessage['content']>,
		fileContent?: { raw: Partial<IUpload>; encrypted?: { algorithm: string; ciphertext: string } | undefined },
	): Promise<void> => send(file, { msg, rid, tmid, t }, getContent, fileContent),
});
