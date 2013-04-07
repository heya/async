# async/Deferred

The implementation of promises in Heya follows in footsteps of Dojo (and, therefore, Twisted) by providing
a compatible base API subset. It refines the concepts inherited from Dojo by painstakingly specifying the
API behavior in all corner cases and furnishes a compact and efficient implementation compliant to this spec.
An extended API fully compatible with Dojo 1.x could be built with an additional facade layer; it is not
required by other Heya facilities and was therefore omitted from the initial version.

## Concepts

### Promise

An object encapsulating the result of a potentially asynchronous computation that can be extracted with help
of its ```then()``` or ```done()``` methods. The user of a promise should generally be prepared that callbacks
passed to ```then()``` and/or ```done()``` may be executed either synchronously (i.e. before the API method 
returns) or asynchronously (i.e. after user's code returns control to the interpreter).
