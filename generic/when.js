/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
([], function(){
	"use strict";

	return function instrumentWhen(Deferred){
		return function when(value, callback, errback, progback){
			var promise;
			if(value && typeof value.then == "function"){
				promise = value;
			}else{
				promise = (Deferred || Promise).resolve(value);
			}
			return arguments.length > 1 ? promise.then(callback, errback, progback) : promise;
		};
	};
});
