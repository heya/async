(function(_,f,g){g=window;g=g.heya||(g.heya={});g=g.async||(g.async={});g.when=f();})
([], function(){
	"use strict";

	return function when(value, Deferred){
		return value && typeof value.then == "function" ? value : (Deferred || Promise).resolve(value);
	};
});
