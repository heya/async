/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred", "./generic/whenDone"], function(Deferred, instrumentWhenDone){
	"use strict";

	return instrumentWhenDone(Deferred);
});
