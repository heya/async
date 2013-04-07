# Primitives for asynchronous execution [![Build Status](https://travis-ci.org/heya/async.png?branch=master)](https://travis-ci.org/heya/async)

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

* [Promise concept and implementation classes](docs/Deferred.js.md)
* Promise algebra: [```all()```](docs/all.js.md), [```any()```](docs/any.js.md), [```par()```](docs/par.js.md), [```one()```](docs/one.js.md)
* [Timeouts](docs/timeout.js.md)
* [Adaptor for values and foreign promise implementations](docs/when.js.md)
* [Wrapper for node.js APIs](docs/promisify.js.md)

