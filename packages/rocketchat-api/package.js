Package.describe({
	name: 'rocketchat:api',
	version: '0.0.1',
	summary: 'Rest API',
	git: ''
});

Package.onUse(function(api) {
	api.use([
		'underscore',
		'ecmascript',
		'rocketchat:lib',
		'nimble:restivus'
	]);

	api.addFiles('server/api.js', 'server');
	api.addFiles('server/settings.js', 'server');

	api.addFiles('server/default/info.js', 'server');

	api.addFiles('server/v1/channels.js', 'server');
	api.addFiles('server/v1/chat.js', 'server');
	api.addFiles('server/v1/groups.js', 'server');
	api.addFiles('server/v1/im.js', 'server');
	api.addFiles('server/v1/integrations.js', 'server');
	api.addFiles('server/v1/misc.js', 'server');
	api.addFiles('server/v1/users.js', 'server');
	api.addFiles('server/v1/settings.js', 'server');
});

Npm.depends({
	busboy: '0.2.13'
});
