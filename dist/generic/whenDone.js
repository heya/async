(function(_,f,g){g=window;g=g.heya||(g.heya={});g=g.async||(g.async={});g=g.generic||(g.generic={});g.whenDone=f();})
([], function(){
	"use strict";

	return function instrumentWhenDone(Deferred){
		return function whenDone(value, callback, errback, progback){
			var promise;
			if(value && typeof value.then == "function"){
				promise = value;
			}else{
				promise = (Deferred || Promise).resolvedPromise(value);
			}
			promise[typeof promise.done == "function" ? "done" : "then"](callback, errback, progback);
		};
	};
});
