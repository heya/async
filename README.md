# Async

[![Build status][travis-image]][travis-url]
[![Dependencies][deps-image]][deps-url]
[![devDependencies][dev-deps-image]][dev-deps-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/heya/async.svg)](https://greenkeeper.io/)
[![NPM version][npm-image]][npm-url]

Promises and operations over them; useful utility functions.

## What is inside?

Practical algorithms for node.js and browsers operating on any Promises (any `then()`-able will do, including ES6's [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)):

* Aggregate all asynchronous operations:
  * `all()` &mdash; similar to standard [`Promise.all()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all). Returns an array of results, or fails with a first failed promise.
  * `par()` &mdash; collects all results into an array, both normal values, and errors. Never fails.
    * Use case: collect all I/O results regardless if they failed or not.
    * Use case: wait for all asynchronous operations to finish regardless of their outcome.
* Race asynchronous operations determing a winner:
  * `race()` AKA `one()` &mdash; similar to standard [`Promise.race()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race). Resolves or fails with the first fulfilled promise.
  * `any()` &mdash; resolves with a first resolved promise. Failed promises are ignored unless all of them have failed. In the latter case it fails with the value of the first one in the array.
    * Use case: use the first successful I/O request, ignore services that failed.
* Orchestrate asynchronous functions:
  * `seq()` &mdash; a helper to run asynchronous operations sequentially one after another.
    * Use case: run operations, which depend on previous asynchronous results.
  * `whilst()` &mdash; a generalized asynchronous loop.
* Adapters:
  * `when()` &mdash; adapt any value (`then()`-able, or a plain value) to a promise.
  * `promisify()` &mdash; adapt node.js asynchronous callback-style functions to promise-based functions.
* Timeouts:
  * `timeout()` &mdash; resolve or reject a value after a timeout. If combine with other composition operations, like `race()`, it can help to implement any time-dependent conditions, e.g., timeouts on operations.
* Specialized deferreds/promises:
  * `Deferred` &mdash; fast deferred implementation without built-in timeouts unlike A+ Promises. Implements progress reports, and cancellations. Very helpful for debugging because it preserves call stacks.
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

All documentation can be found in [project's wiki](https://github.com/heya/async/wiki).

To get more information on underlying concepts:

* [Promises, deferreds, asynchronous operations](https://github.com/heya/async/wiki/Concepts:-promises,-deferreds,-asynchronous-operations.).
* [Differences between Promise, Deferred, and FastDeferred](https://github.com/heya/async/wiki/Concepts:-differences-between-Promise,-Deferred,-and-FastDeferred).

Included algorithms (work across all type of promises):

* [Compositions: all(), par(), any(), one(), race()](https://github.com/heya/async/wiki/Main-algorithms).
* Generalized sequential execution of asynchronous operations: [seq()](https://github.com/heya/async/wiki/async.seq).
* Generalized asynchronous loop: [whilst()](https://github.com/heya/async/wiki/async.whilst).
* The venerable [when()](https://github.com/heya/async/wiki/async.when) to adapt any value to generic `then()`-able promises.
* Module [timeout](https://github.com/heya/async/wiki/async.timeout) to resolve or reject promises after a timeout.

Included implementations of deferreds (can be used instead or alongside with the standard `Promise`):

* Module [Deferred](https://github.com/heya/async/wiki/async.Deferred).
  * Module [Deferred-ext](https://github.com/heya/async/wiki/async.Deferred-ext), which adds compositions instrumented for `Deferred`.
* Module [FastDeferred](https://github.com/heya/async/wiki/async.FastDeferred).
  * Module [FastDeferred-ext](https://github.com/heya/async/wiki/async.FastDeferred-ext), which adds compositions instrumented for `FastDeferred`.
* Differences between them and standard promises are described [here](https://github.com/heya/async/wiki/Concepts:-differences-between-Promise,-Deferred,-and-FastDeferred).

## License

BSD or AFL &mdash; your choice

## Versions

- 1.0.1 &mdash; *Removed a direct dependence on `heya-ice` in `Micro`.*
- 1.0.0 &mdash; *Starts the new generation.*

For information on all pre-1.0.0 versions, please see the commit log.

[npm-image]:      https://img.shields.io/npm/v/heya-async.svg
[npm-url]:        https://npmjs.org/package/heya-async
[deps-image]:     https://img.shields.io/david/heya/async.svg
[deps-url]:       https://david-dm.org/heya/async
[dev-deps-image]: https://img.shields.io/david/dev/heya/async.svg
[dev-deps-url]:   https://david-dm.org/heya/async#info=devDependencies
[travis-image]:   https://img.shields.io/travis/heya/async.svg
[travis-url]:     https://travis-ci.org/heya/async
