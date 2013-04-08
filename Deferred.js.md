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
promise, the parent promise will also be cancelled in case it has no other dependendents.

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

Associates callback, errback and a progress handler with a promise; returns a dependent promise. Any of the arguments
may be omitted or replaced with ```null```; calling ```then()``` without arguments simply issues a dependent promise
without associating any callbacks.

#### Callback

A function that will be called in the event the promise is resolved, receiving the value (which is never another 
promise) that it's been resolved to as its only argument. 

#### Errback

#### Progback

```
var p = promise.then( deferred );
```

Makes ```deferred```, which **must** be an instance of ```Deferred``` -- foreign implementations or dependent promises 
are not accepted -- into a dependent promise, and returns it as the result. The canceller associated with the ```deferred``` 
will never be called as it is no longer the root of the chain. Effects of calling ```resolve()``` or ```reject()``` on 
```deferred``` after it's been passed into ```then()``` are unspecified.

The net effect of the sequence:

```
var deferred = new Deferred();
// a sequence of calls to deferred.then() and deferred.done()
var p = promise.then( deferred );
```

is equivalent to:

```
var deferred = promise.then();
// a sequence of calls to deferred.then() and deferred.done()
var p = deferred;
```

### ```done()```

```
promise.done( 
 function( value ) { ... },
 function( error ) { ... },
 function( value ) { ... }
);
```

or

```
promise.done( deferred );
```

Fully identical to ```done()``` except that it does not return a dependent promise, making it a somewhat more efficient
alternative when the dependent promise value is not needed. It is possible to call ```done()``` without arguments but the
resulting sub-chain will not handle rejections and may cause uncaught exceptions should one occur.

### ```protect()```

```
var p = promise.protect();
```

Returns a dependent promise cancellation of which will never lead to a cancellation of the original promise.

### ```cancel()```

```
promise.cancel( reason );
```

Cancels the promise, leading to a rejection of its direct dependents. Also cancels the parent promise if it has no other
dependents. Overall, the effects of the cancellation must be equivalent to the following:

* Find the nearest ancestor of the cancelled promise that has more than one direct dependent, or, failing that, the root
Deferred;
* If a Deferred was found (note that this implies that it has at most one direct dependent which must lead to the cancelled 
promise or otherwise it **is** the cancelled promise), execute its canceller callback if one was set at construction, passing 
in ```reason``` (an ```undefined``` value if one was not supplied) as its argument. An exception thrown by the canceller is 
redirected to ```ice.uncaught()```, any other result is ignored;
* Execute all errbacks found upstream of the cancelled promise and downstream of the ancestor promise found during the first 
step, ignore any results they may return or exceptions they may throw; if ```reason``` was supplied in the call to 
```cancel()``` pass it as the argument into the errbacks, otherwise pass an instance of ```Deferred.CancelError```;
* Reject the cancelled promise with ```reason``` supplied in the call or with an instance of ```Deferred.CancelError``` if
```reason``` was not supplied.

## Class ```Deferred```

### Constructor

```
var deferred = new Deferred( function( reason ){ ... } );
```

Constructs a new, unresolved, Deferred object. The optional argument can be used to pass in the *canceller* function which
will only be called in the event the Deferred is cancelled and will have a chance of prematurely terminating the asynchronous
process that was supposed to resolve it in the first place.

### ```resolve()```

```
deferred.resolve( value_or_promise );
```

### ```reject()```

```
deferred.reject( value_or_promise );
```

### ```progress()```

```
deferred.progress( value );
```

