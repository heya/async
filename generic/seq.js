/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
([], function(){
	"use strict";

	return function instrumentSeq(Deferred){
		return function seq(array){
			array = Array.prototype.slice.call(array instanceof Array ? array : arguments, 0);

			var begin, resolve, reject, progress;

			if(Deferred){
				begin = new Deferred();
				resolve  = begin.resolve.bind(begin);
				reject   = begin.reject.bind(begin);
				progress = typeof begin.progress == "function" && begin.progress.bind(begin);
				if(begin.promise && typeof begin.promise.then == "function"){
					begin = begin.promise;
				}
			}else{
				begin = new Promise(function(res, rej){
					resolve = res;
					reject  = rej;
				});
			}

			var end = begin;
			array.forEach(function(fn){
				end = end.then(fn);
			});

			return {resolve: resolve, reject: reject, progress: progress, begin: begin, end: end};
		};
	};
});
