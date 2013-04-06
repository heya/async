/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred", "./when"], function(Deferred, when){
	"use strict";

	// based on https://github.com/MaxMotovilov/node-promise/blob/master/promise.js

	function impl(failOnError){
		return function all(array){
			array = Array.prototype.slice.call(array instanceof Array ? array : arguments, 0);

			var todo = array.reduce(function(count, p){
					return count + (p && typeof p.then == "function" ? 1 : 0);
				}, 0),
				deferred = new Deferred(cancel), once = true,
				failed = failOnError ? failOnce : succeed;

			if(todo){
				array.forEach(function(p, i){
					if(p && typeof p.then == "function"){
						when(p, succeed(i), failed(i));
					}
				});
			}else{
				deferred.resolve(array);
			}

			return deferred;

			function succeed(index){
				return function(value){
					array[index] = value;
					if(!--todo){
						deferred.resolve(array);
					}
				};
			}

			function failOnce(index){
				return function(error){
					if(once){
						once = false;
						cancel(index);
						deferred.reject(error);
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
		}
	}

	var all = impl(true);
	all.exclusive = all;
	all.inclusive = impl(false);

	return all;
});
