/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred", "./generic/seq"], function(Deferred, instrumentSeq){
	"use strict";

	return instrumentSeq(Deferred);
});
