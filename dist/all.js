(function(_,f){window.heya.async.all=f(window.heya.async.Deferred,window.heya.async.when);})
(["./Deferred", "./when"], function(Deferred, when){
	"use strict";

	// based on https://github.com/MaxMotovilov/node-promise/blob/master/promise.js

	function impl(failOnError){
		return function all(array){
			array = Array.prototype.slice.call(array instanceof Array ? array : arguments, 0);

			var todo = array.reduce(function(count, p){
					return count + (p && typeof p.then == "function" ? 1 : 0);
				}, 0),
				once = true, cancelled,
				deferred = new Deferred(function(why){
					cancelled = true;
					cancel(why);
				}),
				failed = failOnError ? failOnce : succeed;

			if(todo){
				array.forEach(function(p, i){
					if(p && typeof p.then == "function"){
						when(p, succeed(i), failed(i));
					}
				});
			}else{
				deferred.resolve(array,true);
			}

			return deferred;

			function succeed(index){
				return function(value){
					array[index] = value;
					if(!--todo){
						deferred.resolve(array);
					}
					return value;
				};
			}

			function failOnce(index){
				return function(error){
					if(once){
						once = false;
						cancel(error,index);
						if(!cancelled){
							deferred.reject(error);
						}
					}
					return false;
				};
			}

			function cancel(why,index){
				array.forEach(function(p, i){
					if(i !== index && p && typeof p.then == "function" &&
							typeof p.cancel == "function"){
						p.cancel(why, function(err){ throw err; });
					}
				});
			}
		}
	}

	var all = impl(true);
	all.inclusive = impl(false);

	return all;
});
