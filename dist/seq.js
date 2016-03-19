(function(_,f){window.heya.async.seq=f(window.heya.async.when);})
(["./when"], function(when){
	"use strict";

	return function seq(array, Deferred){
		if(!(array instanceof Array)){
			array = Array.prototype.slice.call(arguments, 0);
			Deferred = null;
		}
		return function(initial){
			return array.reduce(function(acc, fn){ return acc.then(fn); }, when(initial, Deferred));
		};
	};
});
