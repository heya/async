/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
([], function(){
	"use strict";

	return function when(value, Deferred){
		return value && typeof value.then == "function" ? value : (Deferred || Promise).resolve(value);
	};
});
