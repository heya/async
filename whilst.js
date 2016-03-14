/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./when"], function(when){
	"use strict";

	return function whilst(pred, body, Deferred){
		return function loop(value){
			return when(pred(value), Deferred).then(body ? guardedWithBody : guardedNoBody);
			function guardedWithBody(cond){
				return cond ? when(body(value), Deferred).then(loop) : value;
			}
			function guardedNoBody(cond){
				return cond ? loop(cond) : value;
			}
		};
	};
});
