import React, { CSSProperties, useMemo, memo, forwardRef } from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar/src/simplebar.css';

import { useDir } from '../hooks/useDir';


const styleDefault = {
	maxHeight: '100%', flexGrow: 1, overflowY: 'auto', willChange: 'transform',
};

type CustomScrollbarsProps = {
	onScroll?: Function;
	ref: React.Ref<unknown>;
	style?: CSSProperties;
}

const ScrollableContentWrapper = forwardRef<unknown, CustomScrollbarsProps>(({ onScroll, children, style }, ref) => {
	const dir = useDir();
	const simpleBarStyle = useMemo(() => ({ ...style, ...styleDefault }), [style]) as CSSProperties;
	return <SimpleBar data-simplebar-direction={dir} direction={dir} style={simpleBarStyle} scrollableNodeProps={{ ref, onScroll }} children={children}/>;
});

export default memo(ScrollableContentWrapper);
