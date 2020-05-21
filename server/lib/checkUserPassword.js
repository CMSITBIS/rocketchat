import { Accounts } from 'meteor/accounts-base';

/**
 * Check if a given password is the one user by given user or if the user doesn't have a password
 * @param {object} user User object
 * @param {object} pass Object with { plain: 'plain-test-password' } or { sha256: 'sha256password' }
 */
export function checkUserPassword(user = {}, pass) {
	if (!(user.services && user.services.password && user.services.password.bcrypt && user.services.password.bcrypt.trim())) {
		return true;
	}

	const password = pass.plain
		? pass.plain.toLowerCase()
		: {
			digest: pass.sha256.toLowerCase(),
			algorithm: 'sha-256',
		};

	const passCheck = Accounts._checkPassword(user, password);

	if (passCheck.error) {
		return false;
	}

	return true;
}
