(function(_,f,g){g=window;g=g.heya||(g.heya={});g=g.async||(g.async={});g=g.generic||(g.generic={});g.when=f();})
([], function(){
	"use strict";

	return function instrumentWhen(Deferred){
		return function when(value, callback, errback, progback){
			var promise;
			if(value && typeof value.then == "function"){
				promise = value;
			}else{
				promise = (Deferred || Promise).resolve(value);
			}
			return arguments.length > 1 ? promise.then(callback, errback, progback) : promise;
		};
	};
});
