/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./when"], function(instrumentWhen){
	"use strict";

	// based on https://github.com/MaxMotovilov/node-promise/blob/master/promise.js

	function NotRequiredError(){}
	NotRequiredError.prototype = {
		toString: function(){ return "[Error: not required]" }
	}

	function cancel(array, why, index){
		array.forEach(function(p, i){
			if(i !== index && p && typeof p.then == "function" &&
			   typeof p.cancel == "function"){
				p.cancel(why, function(err){ throw err; });
			}
		});
	}

	function countToDos(array){
		var todo = 0;
		for(var i = 0; i < array.length; ++i) {
			var p = array[i];
			if(p && typeof p.then == "function"){
				++todo;
			}
		}
		return todo;
	}

	function All(array, failOnError){
		this.array = array;
		this.todo = countToDos(this.array);
		this.once = true;
		this.cancelled = false;
		this.failed = failOnError ? this.failOnce : this.succeed;
		this.allResolved = this.array;
	}
	All.prototype = {
		succeed: function(index, resolve){
			return function(value){
				this.array[index] = value;
				if(!--this.todo){
					resolve(this.array);
				}
				return value;
			};
		},
		failOnce: function(index, reject){
			return function(error){
				if(this.once){
					this.once = false;
					cancel(this.array, error, index);
					if(!this.cancelled){
						reject(error);
					}
				}
				return false;
			};
		},
		canceler: function(why){
			this.cancelled = true;
			cancel(this.array, why);
		}
	};

	function Any(array, firstFailureConclusive){
		this.array = array;
		this.todo = countToDos(this.array);
		this.resolved = false;
		this.firstFailureConclusive = firstFailureConclusive;
		if(this.todo && this.firstFailureConclusive){
			this.todo = 1;
		}
		this.allResolved = this.array[0];
	}
	Any.prototype = {
		succeed: function(index, resolve){
			return function(value){
				delete this.array[index];
				if(!this.resolved) {
					this.resolved = true;
					resolve(value);
					cancel(this.array, new NotRequiredError(), index);
				}
			};
		},
		failed: function(index, reject){
			return function(err){
				delete this.array[index];
				if(!this.resolved && !--this.todo){
					this.resolved = true;
					cancel(this.array, this.firstFailureConclusive ? err : new NotRequiredError(), index);
					reject(err);
				}
				return false;
			};
		},
		canceler: function(why){
			this.resolved = true;
			cancel(this.array, why);
		}
	};

	function instrument(Type, flag, Deferred, when){
		return function(array){
			array = Array.prototype.slice.call(array instanceof Array ? array : arguments, 0);

			var type = new Type(array, flag),
				succeed = type.succeed.bind(type),
				failed  = type.failed.bind(type),
				P = Deferred && Deferred.Wrapper || Promise;
			return new P(function(resolve, reject, cancel){
				if(type.todo){
					array.forEach(function(p, i){
						if(p && typeof p.then == "function"){
							when(p, succeed(i, resolve), failed(i, reject));
						}
					});
				}else{
					resolve(type.allResolved;
				}
				typeof cancel == "function" && cancel(type.canceler.bind(type));
			});
		}
	}

	return function(Deferred){
		var when = instrumentWhen(Deferred);
		return {
			all: instrument(All, true,  Deferred, when),
			par: instrument(All, false, Deferred, when),
			any: instrument(Any, false, Deferred, when),
			one: instrument(Any, true,  Deferred, when)
		};
	};
});
