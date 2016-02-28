# async/any

```
var promise = any( val1, ... , valN );
```

or

```
var promise = any([ val1, ..., valN ]);
```

Accepts a list of promises and non-promise values of any type either as separate arguments or as a single
argument of the type ```Array```. Returns a promise that resolves to the value of the first of the arguments
to resolve. If non-promises or resolved promises are present in the list, a resolved promise will be returned
with one of their values. If all promises passed into the call are rejected, the resulting promise is also
rejected with the value passed into the last rejected argument.

Any of the promises still unresolved when the final result becomes resolvable will be cancelled. If the returned
promise is cancelled, all as yet unresolved promises in the list are also cancelled with the same reason.
