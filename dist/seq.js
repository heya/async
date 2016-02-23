(function(_,f){window.heya.async.seq=f(window.heya.async.Deferred,window.heya.async.when);})
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
