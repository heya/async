/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-ice/assert", "./Deferred"], function(module, ice, Deferred){
	"use strict";

	ice = ice.specialize(module);

	return function adapt(promise){
		ice.assert(promise && typeof promise.then == "function", "Input value is not recognized as promise");

		var deferred = new Deferred(typeof promise.cancel == "function" ?
				function(reason){ return promise.cancel(reason); } : null);

		promise[typeof promise.done == "function" ? "done" : "then"](
			deferred.resolve.bind(deferred),
			deferred.reject.bind(deferred),
			deferred.progress.bind(deferred));

		return deferred;
	};
});
