/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred"], function(Deferred){
	"use strict";

	//TODO: implement whenDone() (or better name),
	// which uses done() instead of then(), and returns nothing.

	return function when(value, callback, errback, progback){
		var deferred;
		if(value && typeof value.then == "function"){
			deferred = new Deferred(typeof value.cancel == "function" ?
				function(reason){ value.cancel(reason); } : null);
			value[typeof value.done == "function" ? "done" : "then"](
				deferred.resolve.bind(deferred), deferred.reject.bind(deferred),
				deferred.progress.bind(deferred));
		}else{
			deferred = new Deferred();
			deferred.resolve(value);
		}
		return deferred.then(callback, errback, progback);
	};
});
