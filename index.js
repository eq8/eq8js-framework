'use strict';

const Core = require('eq8-core');

module.exports = function exports() {
	const core = new Core();
	const bloomrun = require('bloomrun')();

	bloomrun.default(function fallback(msg, callback) {
		const pattern = JSON.stringify(msg);
		callback(new Error(`Cannot find a match for ${pattern}`))
	});

	core.on('subscribe', (q, callback) => {
		core.logger.debug('subscribe:', q);
		bloomrun.add(q, callback);
	});

	core.on('dispatch', (e, callback) => {
		core.logger.debug('dispatch:', e);
		if(e) {
			bloomrun.lookup(e)(e, (err, done) => {
				if(err) core.logger.error(err);

				if(callback) callback(err, done);
			});
		}
	});

	const api = {
		add: core.subscribe.bind(core),
		act: core.dispatch.bind(core)
	};

	let loading = 0;

	return {
		use: (plugin, opts) => {
			const meta = plugin.bind(api)(opts);

			if (meta) {
				loading++;
				api.act({ init: meta.name }, () => {
					loading--;

					if(!loading) core.emit('ready');
				});
			}
		},
		ready: callback => {
			core.on('ready', callback.bind(api));
		}
	};
};
