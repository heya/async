/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred"], function(Deferred){
	"use strict";

	function actOn(verb){
		return function(ms){
			var handle = setTimeout(function(){
					if(handle){
						handle = null;
						deferred[verb](ms);
					}
				}, Math.max(ms, 0)),
				deferred = new Deferred(function(reason){
					if(handle){
						clearTimeout(handle);
						handle = null;
					}
					return reason;
				});
			return deferred;
		};
	}

	return {
		from:   actOn("resolve"),
		failOn: actOn("reject")
	};
});
