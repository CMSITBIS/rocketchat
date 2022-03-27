import { action } from '@storybook/addon-actions';
import React, { ContextType, FC, useCallback } from 'react';

import {
	ServerContext,
	ServerMethodName,
	ServerMethodParameters,
	ServerMethodReturn,
	UploadResult,
} from '../../../client/contexts/ServerContext';
import { Serialized } from '../../../definition/Serialized';
import { MatchPathPattern, Method, OperationParams, OperationResult, PathFor } from '../../../definition/rest';

const logAction = action('ServerProvider');

const randomDelay = (): Promise<UploadResult> => new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

const absoluteUrl = (path: string): string => new URL(path, '/').toString();

const callEndpoint = <TMethod extends Method, TPath extends PathFor<TMethod>>(
	method: TMethod,
	path: TPath,
	params: Serialized<OperationParams<TMethod, MatchPathPattern<TPath>>>,
): Promise<Serialized<OperationResult<TMethod, MatchPathPattern<TPath>>>> =>
	Promise.resolve(logAction('callEndpoint', method, path, params))
		.then(randomDelay)
		.then(() => undefined as any);

const uploadToEndpoint = (endpoint: string, params: any, formData: any): Promise<UploadResult> =>
	Promise.resolve(logAction('uploadToEndpoint', endpoint, params, formData)).then(randomDelay);

const getStream = (streamName: string, options: {} = {}): (<T>(eventName: string, callback: (data: T) => void) => () => void) => {
	logAction('getStream', streamName, options);

	return (eventName, callback): (() => void) => {
		const subId = Math.random().toString(16).slice(2);
		logAction('getStream.subscribe', streamName, eventName, subId);

		randomDelay().then(() => callback(undefined as any));

		return (): void => {
			logAction('getStream.unsubscribe', streamName, eventName, subId);
		};
	};
};

type ServerProviderMockProps = Omit<Partial<ContextType<typeof ServerContext>>, 'callMethod'> & {
	delay?: 'random' | number;
	callMethod: {
		[TMethodName in ServerMethodName]:
			| ((...args: ServerMethodParameters<TMethodName>) => Promise<ServerMethodReturn<TMethodName>>)
			| 'infinite'
			| 'errored';
	};
};

const ServerProviderMock: FC<ServerProviderMockProps> = ({ children, callMethod, ...overrides }) => {
	const _callMethod = useCallback(
		async <MethodName extends ServerMethodName>(
			methodName: MethodName,
			...args: ServerMethodParameters<MethodName>
		): Promise<ServerMethodReturn<MethodName>> => {
			if (methodName in callMethod) {
				const handler = callMethod[methodName];

				if (handler === 'infinite') {
					logAction('callMethod (infinite)', methodName, ...args);
					return new Promise(() => undefined);
				}

				if (handler === 'errored') {
					logAction('callMethod (errored)', methodName, ...args);
					throw new Error(`${methodName} failed`);
				}

				logAction('callMethod (intercepted)', methodName, ...args);
				return handler(...args);
			}

			logAction('callMethod (undefined)', methodName, ...args);
			return undefined as any;
		},
		[callMethod],
	);

	return (
		<ServerContext.Provider
			children={children}
			value={{
				info: {
					version: 'x.y.z',
					build: {
						platform: 'storybook',
						arch: 'storybook cpu',
						cpus: 1,
						date: new Date().toLocaleDateString(),
						nodeVersion: 'lts',
						osRelease: 'x',
						freeMemory: 639 * 1024,
						totalMemory: 640 * 1024,
					},
					commit: {},
					marketplaceApiVersion: 'x.y.z',
				},
				absoluteUrl,
				callMethod: _callMethod,
				callEndpoint,
				uploadToEndpoint,
				getStream,
				...overrides,
			}}
		/>
	);
};

export default ServerProviderMock;
