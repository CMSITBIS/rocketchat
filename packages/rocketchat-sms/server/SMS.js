import { Meteor } from 'meteor/meteor';
import { RocketChat } from 'meteor/rocketchat:lib';

RocketChat.SMS = {
	enabled: false,
	services: {},
	accountSid: null,
	authToken: null,
	fromNumber: null,

	registerService(name, service) {
		console.log("SMS registerService: " + name, service);
		this.services[name] = service;
	},

	getService(name) {
		console.log("SMS getService: " + name);
		if (!this.services[name]) {
			throw new Meteor.Error('error-sms-service-not-configured');
		}
		return new this.services[name](this.accountSid, this.authToken, this.fromNumber);
	},
};

RocketChat.settings.get('SMS_Enabled', function(key, value) {
	RocketChat.SMS.enabled = value;
});
