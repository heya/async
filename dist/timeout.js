(function(_,f,g){g=window;g=g.heya||(g.heya={});g=g.async||(g.async={});g.timeout=f();})
([], function(){
	"use strict";

	function TimeoutError(ms){
		this.timeout = ms;
	}
	TimeoutError.prototype = {
		toString: function(){ return "[Error: timed out]"; }
	}

	function actOn(P, verb, DefaultResolveTo){
		return function(ms, resolveTo){
			return new P(function(resolve, reject, cancel){
				var handle = setTimeout(function(){
					if(handle){
						handle = null;
						(verb === "resolve" ? resolve : reject)(
							typeof resolveTo !== "undefined"
							? resolveTo : DefaultResolveTo
							? new DefaultResolveTo(ms) : ms);
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

	return function instrumentTimeout(Deferred){
		var P = Deferred && Deferred.Wrapper || Promise;

		var timeout = actOn(P, "reject", TimeoutError);
		timeout.reject  = timeout;
		timeout.resolve = actOn(P, "resolve");

		return timeout;
	};
});
