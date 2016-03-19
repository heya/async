(function(_,f,g){g=window;g=g.heya||(g.heya={});g=g.async||(g.async={});g.timeout=f();})
([], function(){
	"use strict";

	function Timeout(ms){
		this.timeout = ms;
	}
	Timeout.prototype = {
		toString: function(){ return "[Error: timed out]"; }
	};

	function delay(isResolve){
		return function(ms, Deferred){
			var P = Deferred && Deferred.Wrapper || Promise,
				value = isResolve ? ms : new Timeout(ms);
			return new P(function(resolve, reject, cancel){
				var handle = setTimeout(function(){
					if(handle){
						handle = null;
						(isResolve ? resolve : reject)(value);
					}
				}, Math.max(ms, 0));
				typeof cancel == "function" && cancel(function(){
					if(handle){
						clearTimeout(handle);
						handle = null;
					}
				});
			});
		};
	}

	function timeout(Deferred){
		return {
			resolve: function(ms){ return timeout.resolve(ms, Deferred); },
			reject:  function(ms){ return timeout.reject (ms, Deferred); },
			Timeout: Timeout
		};
	}

	timeout.resolve = delay(true);
	timeout.reject  = delay(false);
	timeout.Timeout = Timeout;

	return timeout;
});
