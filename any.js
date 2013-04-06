/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Deferred", "./when"], function(Deferred, when){
	"use strict";

	// based on https://github.com/MaxMotovilov/node-promise/blob/master/promise.js

	function NotRequiredError(){}
	NotRequiredError.prototype = {
		toString: function(){ return "[Error: not required]" }
	}

	function impl(cancelStragglers) {
		return function any(array){
			array = Array.prototype.slice.call(array instanceof Array ? array : arguments, 0);

			var todo = array.reduce(function(count, p){
					return count + (p && typeof p.then == "function" ? 1 : 0);
				}, 0), resolved, 
				deferred = new Deferred(
					function(why) {
						resolved = true;
						cancel(why);
					}
			);

			array.forEach(function(p, i){
				when(p, succeed(i), failed(i));
			});

			return deferred;

			function succeed(index){
				return function(value){
					if( !resolved ) {
						resolved = true;
						deferred.resolve(value);
						if( cancelStragglers ) cancel(new NotRequiredError(),index);
					}
				};
			}

			function failed(index){
				return function(err){
					delete array[index];
					if(!resolved && !--todo){
						deferred.reject(err);
					}
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
		};
	}

	var any = impl(true);
	any.exclusive = any;
	any.inclusive = impl(false);

	return any;
});
