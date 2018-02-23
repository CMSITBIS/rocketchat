Package.describe({
	name: 'rocketchat:user-data-download',
	version: '1.0.0',
	summary: 'Adds setting to allow the user to download all their data stored in the servers.',
	git: ''
});

Package.onUse(function(api) {
	api.use([
		'ecmascript',
		'rocketchat:file',
		'rocketchat:lib'
	]);

	api.addFiles('server/startup/settings.js', 'server');
});
