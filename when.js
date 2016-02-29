/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred", "./generic/when"], function(Deferred, instrumentWhen){
	"use strict";

	return instrumentWhen(Deferred);
});
