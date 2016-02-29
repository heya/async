(function(_,f){f(window.heya.async.Deferred,window.heya.async.generic.compositions);})
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
