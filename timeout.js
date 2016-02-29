/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
([], function(){
	"use strict";

	function TimeoutError(ms){
		this.timeout = ms;
	}
	TimeoutError.prototype = {
		toString: function(){ return "[Error: timed out]"; }
	}

	function actOn(P, verb, DefaultResolveTo){
		return function(ms, uncaught, resolveTo){
			if(verb === "resolve"){
				resolveTo = uncaught;
				uncaught = void 0;
			}
			var value = ms;
			if(typeof resolveTo != "undefined"){
				value = resolveTo;
			}else if(DefaultResolveTo){
				value = new DefaultResolveTo(ms);
			}
			return new P(function(resolve, reject, cancel){
				var handle = setTimeout(function(){
					if(handle){
						handle = null;
						(verb === "resolve" ? resolve : reject)(value, uncaught);
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
