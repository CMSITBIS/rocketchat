import { expect } from 'chai';

import { getTransporter } from '../../../../../../../../server/local-services/instance/getTransporter';

describe('getTransporter', () => {
	it('should return TCP with port 0 by default', () => {
		expect(getTransporter()).to.deep.equal({ type: 'TCP', options: { port: 0, udpDiscovery: false } });
	});

	it('should return TCP with port set via env var', () => {
		expect(getTransporter({ port: '1234' })).to.deep.equal({ type: 'TCP', options: { port: '1234', udpDiscovery: false } });

		expect(getTransporter({ port: '   1234' })).to.deep.equal({ type: 'TCP', options: { port: '1234', udpDiscovery: false } });

		expect(getTransporter({ port: '   1234   ' })).to.deep.equal({ type: 'TCP', options: { port: '1234', udpDiscovery: false } });
	});

	it('should throw if transporter set incorrectly', () => {
		expect(() => getTransporter({ transporter: 'something' })).to.throw('invalid transporter');
	});

	it('should return transporter if set correctly', () => {
		expect(getTransporter({ transporter: 'monolith+nats://address' })).to.equal('nats://address');
	});
});
