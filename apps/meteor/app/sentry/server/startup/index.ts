import { Meteor } from 'meteor/meteor';
import * as Sentry from '@sentry/node';
import { BrowserTracing } from '@sentry/tracing';

import './settings';
import { version } from '../../../../package.json';
import { settings } from '../../../settings/server';
import { hasPermission } from '../../../authorization/server';

settings.watchMultiple(['Sentry_Integration_Enabled', 'Sentry_Dsn', 'Sentry_Trace_Sample_Rate'], (values) => {
	if (values[0] && values[1]) {
		Sentry.init({
			dsn: values[1].toString(),
			integrations: [new BrowserTracing()],
			release: version,
			environment: process.env.NODE_ENV,

			// Set tracesSampleRate to 1.0 to capture 100%
			// of transactions for performance monitoring.
			// We recommend adjusting this value in production
			tracesSampleRate: parseFloat((values[2] || 1).toString()),
		});
	}
});

Meteor.methods({
	sentryTestConnection() {
		const user = Meteor.user();
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'sentryTestConnection',
			});
		}

		if (!hasPermission(user._id, 'test-admin-options')) {
			throw new Meteor.Error('error-not-authorized', 'Not authorized', {
				method: 'sentryTestConnection',
			});
		}
		const dsn = settings.get('Sentry_Dsn');
		if (dsn && typeof dsn === 'string' && dsn?.length > 0) {
			throw new Meteor.Error('sentry_misconfigured');
		}

		Sentry.captureException(new Error('This is a fake error message for testing sentry'));
	},
});
