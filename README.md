# @eq8/framework

[![Greenkeeper badge](https://badges.greenkeeper.io/eq8/framework.svg)](https://greenkeeper.io/)

An opinionated application development framework

## Requirement

- NodeJS >= 6

## Installation

```
npm install --save @eq8/framework
```

## Example

```
const framework = require('@eq8/framework')();

framework.use(function plugin({ greetings }) {
	const services = this;

	services.add({ init: 'sample-plugin' }, ({ init }, done) => {
		console.log('Initializing:', init);
		done();
	});

	services.add({ plugin: 'sample', cmd: 'hello' }, ({ name }, done) => {
		console.log(`${greetings}! I am ${name}`);
		done(null, { name });
	});

	return {
		name: 'sample-plugin'
	};
}, {
	greetings: 'Hello World'
});

framework.ready(function onReady() {
	this.act({ plugin: 'sample', cmd: 'hello', name: 'anonymous' }, (err, args) => {
		console.log('err:', err);
		console.log('args:', args);
	});
});

```

Output:

```
info: initialized
Initializing: sample-plugin
Hello World! I am anonymous
err: null
args: { name: 'anonymous' }
```
