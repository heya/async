/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred", "./index", "./seq"], function(Deferred, algos, seq){
	"use strict";

	Deferred.Wrapper.all  = Deferred.all  = wrap(algos.all);
	Deferred.Wrapper.race = Deferred.race = wrap(algos.race);

	Deferred.par = wrap(algos.par);
	Deferred.any = wrap(algos.any);
	Deferred.one = wrap(algos.one);

	Deferred.seq = wrap(seq);

	return Deferred;

	function wrap(algo){
		return function(array){
			array = array instanceof Array ? array : Array.prototype.slice.call(arguments, 0);
			return algo(array, Deferred);
		};
	}
});
