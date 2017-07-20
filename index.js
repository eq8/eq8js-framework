'use strict';

const Core = require('eq8-core');

module.exports = function exports() {
	const core = new Core();
	const bloomrun = require('bloomrun')();

	bloomrun.default((msg, callback) => (callback && callback(new Error('handler-not-found'), msg)));

	core.on('subscribe', (q, callback) => {
		core.logger.debug('subscribe:', q);
		bloomrun.add(q, callback);
	});

	core.on('dispatch', (e, callback) => {
		core.logger.debug('dispatch:', e);
		if (e) {
			bloomrun.lookup(e)(e, callback || (() => {})); // provide a noop callback at least
		}
	});

	const api = {
		add: core.subscribe.bind(core),
		act: core.dispatch.bind(core)
	};

	let loading = 0;
	let ready = false;

	return {
		use: (plugin, opts) => {
			const meta = plugin.bind(api)(opts);

			if (meta) {
				loading++;
				api.act({ init: meta.name }, () => {
					loading--;

					if (!loading) {
						ready = true;
						core.emit('ready');
					}
				});
			}
		},
		ready: callback => {
			const init = callback.bind(api);

			if (!ready) {
				core.on('ready', init);
			} else {
				init();
			}
		}
	};
};
