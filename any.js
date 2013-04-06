/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred", "./when"], function(Deferred, when){
	"use strict";

	// based on https://github.com/MaxMotovilov/node-promise/blob/master/promise.js

	function impl(cancelStragglers) {
		return function any(array){
			array = Array.prototype.slice.call(array instanceof Array ? array : arguments, 0);

			var todo = array.reduce(function(count, p){
					return count + (p && typeof p.then == "function" ? 1 : 0);
				}, 0),
				deferred = new Deferred(cancel), resolved = false;

			array.forEach(function(p, i){
				when(p, succeed(i), failed(i));
			});

			return deferred;

			function succeed(index){
				return function(value){
					resolved = true;
					deferred.resolve(value);
					if( cancelStragglers ) cancel(index);
				};
			}

			function failed(index){
				return function(){
					if(!resolved){
						array[index] = null;
						if(!--todo){
							deferred.reject();
						}
					}
				};
			}

			function cancel(index){
				array.forEach(function(p, i){
					if(i != index && p && typeof p.then == "function" &&
							typeof p.cancel == "function"){
						p.cancel();
					}
				});
			}
		};
	}

	var any = impl(true);
	any.exclusive = any;
	any.inclusive = impl(false);

	return any;
});
