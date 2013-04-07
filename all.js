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
				once = true, cancelled,
				deferred = new Deferred( 
					function(why){ 
						cancelled = true;
						cancel(why);
					}
				), 
				fail = failOnError ? failOnce : 
					   todo < array.length ? succeed :
					   provisionallySucceed;

			if(todo){
				array.forEach(function(p, i){
					if(p && typeof p.then == "function"){
						when(p, succeed(i), fail(i));
					}
				});
			}else{
				deferred.resolve(array);
			}

			return deferred;

			function provisionallySucceed(index) {
				var fail = failOnce(index),
					succ = succeed(index,true);
				return function(value) {
					if( once && todo==1 )
						return fail(value);
					else
						return succ(value);
				}
			}

			function succeed(index,isFailure){
				return function(value){
					array[index] = value;
					if(!failOnError && !isFailure) 
						once = false;
					if(!--todo)
						deferred.resolve(array);
				};
			}

			function failOnce(index){
				return function(error){
					if(once){
						once = false;
						cancel(error,index);
						if( !cancelled )
							deferred.reject(error);
					}
					return false;
				};
			}

			function cancel(why,index){
				array.forEach(function(p, i){
					if(i !== index && p && typeof p.then == "function" &&
							typeof p.cancel == "function"){
						p.cancel(why);
					}
				});
			}
		}
	}

	var all = impl(true);
	all.inclusive = impl(false);

	return all;
});
