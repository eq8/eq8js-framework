'use strict';

const test = require('tape');
const framework = require('..')();

test('plugin w/ meta', t => {
	const plugin1 = 'plugin-with-meta-1';
	const plugin2 = 'plugin-with-meta-1';
	const optsFixture = { opt1: 'opt1' };
	const scenario1 ={ init: plugin1 };
	const scenario2 = { plugin1, scenario: 'without-error' };
	const scenario3 ={ init: plugin2 };

	t.plan(5);

	framework.use(function pluginFn1(opts) {
		const services = this;

		t.equal(opts, optsFixture);

		services.add(scenario1, ({ init }, done) => {
			t.equal(init, plugin1);

			setTimeout(done, 100, null, { init });
		});

		services.add(scenario2, (args, done) => {
			t.equal(args, scenario2);
			done(null, args);
		});

		return {
			name: plugin1
		}
	}, optsFixture);

	framework.use(function pluginFn2(opts) {
		const services = this;

		services.add(scenario3, ({ init }, done) => {
			t.equal(init, plugin2);

			setTimeout(done, 100, null, { init });
		});

		return {
			name: plugin2
		};
	});

	framework.ready(function ready() {
		const services = this;

		services.act(scenario2, (err, args) => {
			t.equal(args, scenario2);
		});
	});
});

test('plugin w/o meta', t => {
	const plugin = 'plugin-without-meta';
	const optsFixture = { opt1: 'opt1' };
	const scenario1 = { plugin, scenario: 'without-error' };
	const scenario2 = { plugin, scenario: 'with-error' };

	t.plan(6);

	framework.use(function pluginFn(opts) {
		const services = this;

		// should be triggered twice: one with callback and another without
		services.add(scenario1, (args, done) => {
			t.equal(args, scenario1);

			// don't check if done is undefined to test that noop callback was provided
			done(null, args);
		});
	});

	framework.ready(function ready() {
		const services = this;

		services.act(scenario1, (err, args) => {
			t.equal(args, scenario1);
		});

		services.act(scenario1);

		services.act(scenario2, (err, args) => {
			t.ok(!!err);
			t.equal(err.message, 'handler-not-found');
			t.equal(args, scenario2);
		});

		services.act(null, () => {
			// should throw a `plan != count` if ever reached
			t.ok(false, 'this code path should never be reached');
		});
	});
});
