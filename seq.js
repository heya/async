/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred", "./when"], function(Deferred, when){
	"use strict";

	return function seq(array){
		array = Array.prototype.slice.call(array instanceof Array ? array : arguments, 0);

		var begin = new Deferred(), end = begin;

		array.forEach(function(fn){
			end = end.then(fn);
		});

		return {begin: begin, end: end};
	};
});
