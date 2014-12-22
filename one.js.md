# async/one

```
var promise = one( val1, ... , valN );
```

or

```
var promise = one([ val1, ..., valN ]);
```

Accepts a list of promises and non-promise values of any type either as separate arguments or as a single
argument of the type ```Array```. Returns a promise that resolves to the value of the first of the arguments
to resolve or rejectes with the value of the first of the promises to reject. If non-promises or resolved 
(or rejected) promises are present in the list, a resolved (or rejected) promise will be returned with one 
of their values. If both non-promise values (or resolved promises) and rejected promises are present in the
list, the returned value may be either a resolved or a rejected promise. 

Any of the promises still unresolved when the final result is determined, will be cancelled. If the returned 
promise is cancelled, all as yet unresolved promises in the list are also cancelled.
