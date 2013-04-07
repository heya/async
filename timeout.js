/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred","./any"], function(Deferred, any){
	"use strict";

	function TimeoutError(ms){
		this.timeout = ms;
	}
	TimeoutError.prototype = {
		toString: function() { return "[Error: timed out]"; }
	}

	function actOn(verb,resolveToCons){
		return function(ms,resolveTo){
			var handle = setTimeout(function(){
					if(handle){
						handle = null;
						deferred[verb](
							typeof resolveTo !== "undefined" 
							 ? resolveTo 
							: resolveToCons
							 ? new resolveToCons(ms) : ms 
						);
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

	function cancelPromise(promise,ms,rejectWith) {
		return any.one( promise, timeout.reject(ms,rejectWith) );
	}

	var timeout = actOn("resolve");

	timeout.resolve = timeout;
	timeout.reject = actOn("reject",TimeoutError);
	timeout.cancel = cancelPromise;

	return timeout;
});
