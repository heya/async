/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./FastDeferred", "./generic/compositions"], function(Deferred, compositions){
	"use strict";

	var algos = compositions(Deferred);

	Deferred.Wrapper.all  = Deferred.all  = algos.all;
	Deferred.Wrapper.race = Deferred.race = algos.race;

	Deferred.par = algos.par;
	Deferred.any = algos.any;
	Deferred.one = algos.one;

	return Deferred;
});
