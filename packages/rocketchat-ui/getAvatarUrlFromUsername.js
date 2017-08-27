// TODO: remove global
this.getAvatarUrlFromUsername = function(username) {
	const externalSource = (RocketChat.settings.get('Accounts_ExternalSource') || '').trim().replace(/\/$/, '');
	if (externalSource.length) {
		const url = externalSource.replace('{username}', username);
		return `${ url }`;
	}

	const key = `avatar_random_${ username }`;
	const random = typeof Session !== 'undefined' ? Session.keys[key] : 0;
	if (username == null) {
		return;
	}
	const cdnPrefix = (RocketChat.settings.get('CDN_PREFIX') || '').trim().replace(/\/$/, '');
	const pathPrefix = (__meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '').trim().replace(/\/$/, '');
	let path = pathPrefix;
	if (cdnPrefix) {
		path = cdnPrefix + pathPrefix;
	} else if (Meteor.isCordova) {
		path = Meteor.absoluteUrl().replace(/\/$/, '');
	}
	return `${ path }/avatar/${ encodeURIComponent(username) }?_dc=${ random }`;
};
