/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
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
