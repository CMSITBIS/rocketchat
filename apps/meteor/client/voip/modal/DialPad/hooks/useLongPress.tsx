import { useEffectEvent } from '@rocket.chat/fuselage-hooks';
import type { KeyboardEvent, KeyboardEventHandler, MouseEvent, MouseEventHandler, PointerEvent, PointerEventHandler } from 'react';
import { useRef } from 'react';

type UseLongPressResult = {
	onClick: MouseEventHandler<HTMLButtonElement>;
	onPointerUp: PointerEventHandler<HTMLButtonElement>;
	onPointerDown: PointerEventHandler<HTMLButtonElement>;
	onKeyDown: KeyboardEventHandler<HTMLButtonElement>;
	onKeyUp: KeyboardEventHandler<HTMLButtonElement>;
};

export function useLongPress(
	onLongPress: () => void,
	options?: Partial<UseLongPressResult> & {
		threshold?: number;
	},
): UseLongPressResult {
	const isLongPress = useRef(false);
	const timerRef = useRef<NodeJS.Timeout>();

	const startPressTimer = useEffectEvent((): void => {
		isLongPress.current = false;
		timerRef.current = setTimeout(() => {
			isLongPress.current = true;
			onLongPress();
		}, options?.threshold ?? 700);
	});

	const handleOnClick = useEffectEvent((e: MouseEvent<HTMLButtonElement>): void => {
		if (isLongPress.current || !options?.onClick) {
			return;
		}

		options.onClick(e);
	});

	const handleOnPointerDown = useEffectEvent((e: PointerEvent<HTMLButtonElement>): void => {
		startPressTimer();

		options?.onPointerDown?.(e);
	});

	const handleOnPointerUp = useEffectEvent((e: PointerEvent<HTMLButtonElement>): void => {
		clearTimeout(timerRef.current);

		options?.onPointerUp?.(e);
	});

	const handleOnKeyDown = useEffectEvent((e: KeyboardEvent<HTMLButtonElement>) => {
		if (e.code !== 'Space' && e.code !== 'Enter') {
			options?.onKeyDown?.(e);
			return;
		}

		startPressTimer();
		options?.onKeyDown?.(e);
	});

	const handleOnKeyUp = useEffectEvent((e: KeyboardEvent<HTMLButtonElement>): void => {
		if (e.code !== 'Space' && e.code !== 'Enter') {
			options?.onKeyUp?.(e);
			return;
		}

		e.preventDefault();
		clearTimeout(timerRef.current);

		options?.onKeyUp?.(e);
	});

	return {
		onClick: handleOnClick,
		onKeyDown: handleOnKeyDown,
		onKeyUp: handleOnKeyUp,
		onPointerDown: handleOnPointerDown,
		onPointerUp: handleOnPointerUp,
	};
}
