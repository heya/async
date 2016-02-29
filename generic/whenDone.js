/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
([], function(){
	"use strict";

	return function instrumentWhenDone(Deferred){
		return function whenDone(value, callback, errback, progback){
			var promise;
			if(value && typeof value.then == "function"){
				promise = value;
			}else{
				promise = (Deferred || Promise).resolvedPromise(value);
			}
			promise[typeof promise.done == "function" ? "done" : "then"](callback, errback, progback);
		};
	};
});
