/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred", "./generic/compositions"], function(Deferred, compositions){
	"use strict";

	var algos = compositions(Deferred);

	Deferred.all = algos.all;
	Deferred.par = algos.par;
	Deferred.any = algos.any;
	Deferred.one = algos.one;
	Deferred.race = algos.race;

	return Deferred;
});
