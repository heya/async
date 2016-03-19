(function(_,f){f(window.heya.async.FastDeferred,window.heya.async.index,window.heya.async.seq);})
(["./FastDeferred", "./index", "./seq"], function(Deferred, algos, seq){
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
