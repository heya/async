# Async

[![Build status][travis-image]][travis-url]
[![Dependencies][deps-image]][deps-url]
[![devDependencies][dev-deps-image]][dev-deps-url]
[![NPM version][npm-image]][npm-url]


Promises and operations over them; useful utility functions.

## What is inside?

Practical algorithms for node.js and browsers operating on any Promises (any `then()`-able will do, including ES6's [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)):

* Aggregate all asynchronous operations:
  * `all()` &mdash; similar to standard [`Promise.all()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all). Returns an array of results, or fails with a first failed promise.
  * `par()` &mdash; collects all results into an array, both normal values, and errors. Never fails.
    * Use case: collect all I/O results regardless of they failed or not.
  * `seq()` &mdash; run asynchronous operations sequentially one after another.
* Race asynchronous operations determing a winner:
  * `race()` AKA `one()` &mdash; similar to standard [`Promise.race()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race). Resolves or fails with the first fulfilled promise.
  * `any()` &mdash; resolves with a first resolved promise. Failed promises are ignored.
    * Use case: use the first successful I/O request, ignore services that failed.
* Adapters:
  * Adapt any value (`then()`-able, or a plain value) to a promise: the venerable `when()`.
  * Adapt node.js asynchronous callback-style functions to promises.
* Timeouts:
  * `timeout()` &mdash; resolve or reject a value after a timeout. If combine with other composition operations, like `race()`, it can help to implement any time-dependent conditions, e.g., timeouts on operations.
* Specialized deferreds/promises:
  * `Deferred` &mdash; fast deferred implementation without built-in timeouts like A+ Promises. Implements progress reports, and cancellations. Very helpful for debugging because it preserves call stacks.
  * `FastDeferred` &mdash; just like `Deferred` but even faster, because it doesn't convert exceptions into failed promises implicitly. It allows to JIT all of its code, and helps to debug unexpected exceptions.

## How to install

With `npm`:

```sh
npm install --save heya-async
```

With `bower`:

```sh
bower install --save heya-async
```

## Documentation

* [Promise concept and implementation classes](./docs/Deferred.js.md)
* Promise algebra: [```all()```](./docs/all.js.md), [```any()```](./docs/any.js.md), [```par()```](./docs/par.js.md), [```one()```](./docs/one.js.md)
* [Timeouts](./docs/timeout.js.md)
* [Adaptor for values and foreign promise implementations](./docs/when.js.md)
* [Wrapper for node.js APIs](./docs/promisify.js.md)

## License

BSD or AFL &mdash; your choice

[npm-image]:      https://img.shields.io/npm/v/heya-async.svg
[npm-url]:        https://npmjs.org/package/heya-async
[deps-image]:     https://img.shields.io/david/heya/async.svg
[deps-url]:       https://david-dm.org/heya/async
[dev-deps-image]: https://img.shields.io/david/dev/heya/async.svg
[dev-deps-url]:   https://david-dm.org/heya/async#info=devDependencies
[travis-image]:   https://img.shields.io/travis/heya/async.svg
[travis-url]:     https://travis-ci.org/heya/async
