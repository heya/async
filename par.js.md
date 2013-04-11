# async/par

```
var promise = par( val1, ... , valN );
```

or

```
var promise = par([ val1, ..., valN ]);
```

Accepts a list of promises and non-promise values of any type either as separate arguments or as a single
argument of the type ```Array```. Returns a promise that resolves to the array containing only non-promise
values -- the ones the promises have resolved to and originals where non-promises were passed in -- in the
same order, after all passed in promises have resolved. Any resolved promises passed into the call will
be replaced with their values. If all arguments are non-promises or resolved promises, a resolved promise
will be returned.

If any of the promises is rejected, it is replaced in the list with the value it was rejected with. Note that
it is not possible to tell afterwards whether a promise has been rejected or resolved, unless the determination
can be made based on the resulting value (e.g. with an ```instanceof Error``` check). The returned promise
is never rejected. If the returned promise is cancelled, all as yet unresolved promises in the list are also
cancelled with the same reason.
