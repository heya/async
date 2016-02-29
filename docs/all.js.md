# async/all

```
var promise = all( val1, ... , valN );
```

or

```
var promise = all([ val1, ..., valN ]);
```

Accepts a list of promises and non-promise values of any type either as separate arguments or as a single
argument of the type ```Array```. Returns a promise that resolves to the array containing only non-promise
values -- the ones the promises have resolved to and originals where non-promises were passed in -- in the
same order, after all passed in promises have resolved. Any resolved promises passed into the call will
be replaced with their values. If all arguments are non-promises or resolved promises, a resolved promise
will be returned.

If any of the promises is rejected, the resulting promise will also be rejected. If a rejected promise is
passsed in, the returned value will also be a rejected promise. In either case, any promises in the list
that have not yet been resolved, will be cancelled with the reason taken from the rejection's value. If the
returned promise is cancelled, all as yet unresolved promises in the list are also cancelled with the same
reason.
