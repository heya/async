# async/Deferred

The implementation of promises in Heya follows in footsteps of Dojo (and, therefore, Twisted) by providing
a compatible base API subset. It refines the concepts inherited from Dojo by painstakingly specifying the
API behavior in all corner cases and furnishes a compact and efficient implementation compliant to this spec.
An extended API fully compatible with Dojo 1.x could be built with an additional facade layer; it is not
required by other Heya facilities and was therefore omitted from the initial version.

## Concepts

### Promise

An object encapsulating the result of a potentially asynchronous computation or process that can be extracted 
with help of its ```then()``` or ```done()``` methods. 

#### Resolution and rejection

The result of a promise may obtain in one of two forms: *resolution*, which is a conceptual equivalent of returned
value or *rejection*, which is an equivalent of an exception. Unhandled rejections may be converted to actual
Javascript exceptions.

#### Resolved vs. unresolved promises

An unresolved promise does not yet have its result available but is guaranteed -- subject to completion of the
associated asynchronous process -- to provide one at a later time. A resolved promise does have its result available
immediately. The user of a promise should generally be prepared that callbacks passed to ```then()``` and/or ```done()``` 
may be executed either synchronously (i.e. before the API method returns) or asynchronously (i.e. after user's code 
returns control to the interpreter). A rejected promise also has its result -- in the form of a rejection -- available 
immediately.

#### Chaining promises

Method ```then()``` is used to extract the result from a promise and issue another, *dependent* promise which will be 
resolved after the appropriate callback passed into ```then()``` executes and returns a non-promise value or a resolved 
promise, **or** after the un-resolved promise returned by the callback is resolved. It is possible to transform promise 
rejection into resolution and vice versa using chaining. 

Method ```done()``` is used to end the chain without creating a dependent promise object and is equivalent to ```then()``` 
other than for this performance optimization.

##### Callbacks and errbacks

Both ```then()``` and ```done()``` accept two separate callback functions intended to handle resolution and rejection
respectively. By convention, the first one is called *callback* and the second one *errback*.

#### Native promise

The implementation of promise provided by Heya; provides additional functionality related to promise 
*cancellation* and propagation of progress events. Any Heya API said to return a promise is guaranteed to return 
a native promise object. Native promises should not be constructed directly; the native promise constructor is 
available as ```Deferred.Promise``` only for the purposes of ```instanceof``` checks.

##### Promise cancellation

An unresolved promise may be *cancelled*, leading to its rejection; if the promise was obtained by chaining from another
promise, the associated errback -- if any -- will be executed and so will be the parent promise in case it has no other
dependendents.

#### Foreign promise

An implementation of promise compatible with the same concept but provided by a 3rd party library. Heya APIs 
accepting promise arguments are generally expected to interoperate with foreign promises; exceptions are flagged
explicitly in the documentation. It is sufficient for a foreign promise to implement either ```then()``` or
```done()```, the latter is preferred to the former if both methods are available.

### Deferred

Also known as a *future*; an object used to associate the asynchronous process with a promise. In Heya implementation,
```Deferred``` is a subclass of a promise that supplies additional API methods to initiate resolution or rejection
of a promise chain as well as a provision to cancel the underlying process in case when the associated promise is 
cancelled.

## Class ```Deferred.Promise```

Note: cannot be constructed directly; instances are obtained by applying ```then()``` to other native promises or Deferred 
objects.

### ```then()```

```
var p = promise.then( 
 function( value ) { ... },
 function( error ) { ... },
 function( value ) { ... }
);
```

### ```done()```

```
promise.done( 
 function( value ) { ... },
 function( error ) { ... },
 function( value ) { ... }
);
```

### ```protect()```

```
var p = promise.protect();
```

### ```cancel()```

promise.cancel( reason );

## Class ```Deferred```

### Constructor

```
var p = new Deferred( function( reason ){ ... } );
```

Constructs a new, unresolved, Deferred object.


