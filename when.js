/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred"], function(Deferred){
	"use strict";

	//TODO: implement whenDone() (or better name),
	// which uses done() instead of then(), and returns nothing.

	return function when(value, callback, errback, progback){
		var deferred;
		if( value instanceof Deferred.Promise ) {
			deferred = value;
		} else {
			deferred = new Deferred();
			deferred.resolve(value);
		}
		return arguments.length > 1 ? deferred.then(callback, errback, progback) : deferred;
	};
});
