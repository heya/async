(function(_,f,g){g=window;g=g.heya||(g.heya={});g=g.async||(g.async={});g=g.generic||(g.generic={});g.seq=f();})
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
