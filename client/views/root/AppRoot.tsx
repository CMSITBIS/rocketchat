import React, { FC, lazy, Suspense } from 'react';

import PageLoading from './PageLoading';

const ConnectionStatusBar = lazy(
	() => import('../../components/connectionStatus/ConnectionStatusBar'),
);
const MeteorProvider = lazy(() => import('../../providers/MeteorProvider'));
const BannerRegion = lazy(() => import('../banners/BannerRegion'));
const BlazeLayoutWrapper = lazy(() => import('./BlazeLayoutWrapper'));
const PortalsWrapper = lazy(() => import('./PortalsWrapper'));

const AppRoot: FC = () => (
	<Suspense fallback={<PageLoading />}>
		<MeteorProvider>
			<ConnectionStatusBar />
			<BannerRegion />
			<BlazeLayoutWrapper />
			<PortalsWrapper />
		</MeteorProvider>
	</Suspense>
);

export default AppRoot;
