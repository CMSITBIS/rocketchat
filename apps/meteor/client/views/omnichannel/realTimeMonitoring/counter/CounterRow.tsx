import { Box, Divider } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactNode } from 'react';
import React, { Fragment } from 'react';
import flattenChildren from 'react-keyed-flatten-children';

type CounterRowProps = {
	children: ReactNode[];
} & ComponentProps<typeof Box>;

const CounterRow = ({ children, ...props }: CounterRowProps) => (
	<Box pb={28} pi={20} display='flex' flexDirection='row' justifyContent='space-around' alignItems='center' flexGrow={1} {...props}>
		{children &&
			flattenChildren(children).reduce((acc: ReactNode[], child, i) => {
				acc =
					children.length - 1 !== i
						? [
								...acc,
								<Fragment key={i}>{child}</Fragment>,
								<Divider key={(i + 1) * children.length} width='x2' m='none' alignSelf='stretch' />,
						  ]
						: [...acc, child];
				return acc;
			}, [])}
	</Box>
);

export default CounterRow;
