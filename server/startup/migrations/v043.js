RocketChat.Migrations.add({
	version: 43,
	up: function() {
		if (RocketChat && RocketChat.models && RocketChat.models.Permissions) {
			RocketChat.models.Permissions.update({ _id: 'pin-message' }, { $addToSet: { roles: 'admin' } });
		}
	}
});
