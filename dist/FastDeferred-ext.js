(function(_,f){f(window.heya.async.FastDeferred,window.heya.async.generic.compositions);})
(["./FastDeferred", "./generic/compositions"], function(Deferred, compositions){
	"use strict";

	var algos = compositions(Deferred);

	Deferred.all = algos.all;
	Deferred.par = algos.par;
	Deferred.any = algos.any;
	Deferred.one = algos.one;
	Deferred.race = algos.race;
	Deferred.when = algos.when;

	return Deferred;
});
