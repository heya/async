(function(_,f){window.heya.async.whilst=f(window.heya.async.when);})
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
