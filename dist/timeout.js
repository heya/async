(function(_,f){window.heya.async.timeout=f(window.heya.async.Deferred,window.heya.async.one);})
(["./Deferred","./one"], function(Deferred, one){
	"use strict";

	function TimeoutError(ms){
		this.timeout = ms;
	}
	TimeoutError.prototype = {
		toString: function(){ return "[Error: timed out]"; }
	}

	function actOn(verb, resolveToCons){
		return function(ms, resolveTo){
			var handle = setTimeout(function(){
					if(handle){
						handle = null;
						deferred[verb](typeof resolveTo !== "undefined"
							? resolveTo : resolveToCons
								? new resolveToCons(ms) : ms);
					}
				}, Math.max(ms, 0)),
				deferred = new Deferred(function(){
					if(handle){
						clearTimeout(handle);
						handle = null;
					}
				});
			return deferred;
		};
	}

	function cancelPromise(promise, ms, rejectWith){
		return one(promise, timeout.reject(ms, rejectWith));
	}

	var timeout = actOn("reject", TimeoutError);

	timeout.reject  = timeout;
	timeout.resolve = actOn("resolve");
	timeout.cancel  = cancelPromise;

	return timeout;
});
