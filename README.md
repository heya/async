# Async

[![Build status][travis-image]][travis-url]
[![Dependencies][deps-image]][deps-url]
[![devDependencies][dev-deps-image]][dev-deps-url]
[![NPM version][npm-image]][npm-url]


Promises and operations over them; useful utility functions.

## How to install

If you plan to use it in your [node.js](http://nodejs.org) project install it
like this:

```
npm install heya-async
```

For your browser-based projects I suggest to use [volo.js](http://volojs.org):

```
volo install heya/async heya-async
```

## Documentation

* [Promise concept and implementation classes](Deferred.js.md)
* Promise algebra: [```all()```](all.js.md), [```any()```](any.js.md), [```par()```](par.js.md), [```one()```](one.js.md)
* [Timeouts](timeout.js.md)
* [Adaptor for values and foreign promise implementations](when.js.md)
* [Wrapper for node.js APIs](promisify.js.md)

[npm-image]:      https://img.shields.io/npm/v/heya-async.svg
[npm-url]:        https://npmjs.org/package/heya-async
[deps-image]:     https://img.shields.io/david/heya/async.svg
[deps-url]:       https://david-dm.org/heya/async
[dev-deps-image]: https://img.shields.io/david/dev/heya/async.svg
[dev-deps-url]:   https://david-dm.org/heya/async#info=devDependencies
[travis-image]:   https://img.shields.io/travis/heya/async.svg
[travis-url]:     https://travis-ci.org/heya/async
