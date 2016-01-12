/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Micro"], function(Micro){
	"use strict";

	function Resolved(x, ctx){
		this.x = x;
		this.ctx = ctx;
	}

	function Rejected(x, ctx){
		this.x = x;
		this.ctx = ctx;
		ctx.push(this);
	}

	Rejected.prototype = {
		nativeRebindAdapter: function(val){
			return val instanceof Resolved ? new Rejected(val.x, val.ctx) : val;
		}
	};

	function Progress(x){
		this.x = x;
	}

	function CancelError(){}
	CancelError.prototype = {
		toString: function(){ return "[Error: cancelled]"; }
	};

	function Promise(micro){
		this.micro = micro;
		micro.rebind = this._rebind.bind(this);
		micro.cancel = this._cancel.bind(this);
	}

	Promise.prototype = {
		declaredClass: "heya-async/FastDeferred/Promise",

		cancel: function(reason, uncaught){
			var ctx = [];
			this._cancel(new Rejected(typeof reason === "undefined" ? new CancelError() : reason, ctx));
			processUncaught(ctx.slice(1), uncaught);
		},
		then: function(callback, errback, progback){
			if(callback instanceof FastDeferred){
				var r = this.then();
				callback.promise.micro.resolve(new Resolved(r));
				return r;
			}
			return new Promise(this.micro.then(makeCallback(callback, errback, progback)));
		},
		done: function(callback, errback, progback){
			if(callback instanceof FastDeferred){
				callback.promise.micro.resolve(new Resolved(this));
			}else{
				this.micro.done(makeCallback(callback, errback, progback));
			}
		},
		thenBoth: function(callback){
			return this.then(callback, callback);
		},
		doneBoth: function(callback){
			this.done(callback, callback);
		},
		"catch": function(errback){
			return this.then(null, errback);
		},
		finalCatch: function(errback){
			this.done(null, errback);
		},
		protect: function() {
			this.done();
			return this.then();
		},
		_rebind: function(val){
			if(Micro.prototype.rebind.call(this.micro, val)){
				return true;
			}
			if(val && val.x instanceof Promise &&
			   Micro.prototype.rebind.call(this.micro, val.x.micro, val.nativeRebindAdapter)){
				if(val instanceof Rejected){
					val.handled = true;
				}
				return true;
			}
			return false;
		},
		_cancel: function(errVal){
			if(this.canceler){
				this.canceler(errVal.x);
			}

			var ctx = [];
			Micro.prototype.cancel.call(this.micro, new Rejected(errVal.x, ctx));
			errVal.ctx.push.apply(errVal.ctx, ctx.slice(1));
			this.micro.resolve(errVal);
			this.canceled = true;
		}
	};

	function FastDeferred(canceler){
		// intentionally altering Promise constructor parameters
		this.promise = new Promise(new Micro());
		this.promise._rebind = rebinder(this);
		this.promise.canceler = canceler;
	}
	FastDeferred.prototype.declaredClass = "heya-async/FastDeferred";

	FastDeferred.prototype.resolve  = makeResolver(Resolved);
	FastDeferred.prototype.progress = makeResolver(Progress);
	FastDeferred.prototype.reject   = makeResolver(Rejected);

	function rebinder(deferred){
		return function(val){
			if(Promise.prototype._rebind.call(this, val)){
				return true;
			}
			if(val && val.x){
				var then = val.x.then;
				if(typeof then == "function"){
					var done = val.x.done;
					if(typeof done == "function"){
						then = done;
					}
					then.call(val.x, deferred.resolve.bind(deferred),
						deferred.reject.bind(deferred), deferred.progress.bind(deferred));
					return true;
				}
			}
			return false;
		};
	}

	FastDeferred.resolve = function(val){
		return new FastDeferred().resolve(val).promise;
	};

	FastDeferred.reject = function(val){
		return new FastDeferred().reject(val, true).promise;
	};

	// export

	FastDeferred.CancelError = CancelError;
	FastDeferred.Promise = Promise;

	return FastDeferred;

	// utilities

	function makeCallback(callback, errback, progback){
		callback = typeof callback == "function" && callback;
		errback  = typeof errback  == "function" && errback;
		progback = typeof progback == "function" && progback;

		return function(val){
			if(val instanceof Progress){
				if(progback){
					progback(val.x);
				}
				return val;
			}

			var cb = val instanceof Resolved && callback ||
				val instanceof Rejected && errback;
			if(cb){
				var v = cb(val.x);
				if(val instanceof Rejected){
					val.handled = true;
				}
				if(v === val.x){
					return val;
				}
				if(v instanceof Promise){
					return v.micro;
				}
				if(v instanceof FastDeferred){
					return v.promise.micro;
				}
				if(v && typeof v.then == "function"){
					return new FastDeferred.resolve(v).promise.micro;
				}
				return new Resolved(v);
			}
			return val;
		};
	}

	function makeResolver(Type) {
		return Type === Progress ?
			function(val) {
				if(!this.promise.canceled){
					this.promise.micro.resolve(new Progress(val), true);
				}
				return this;
			} :
			function(val, uncaught){
				if(!this.promise.canceled){
					var ctx = [];
					this.promise.micro.resolve(new Type(val instanceof FastDeferred ? val.promise : val, ctx));
					processUncaught(ctx, uncaught);
				}
				return this;
			};
	}

	function processUncaught(ctx, uncaught){
		if(typeof uncaught != "function"){
			if(uncaught){
				return;
			}
			uncaught = uncaughtHandler;
		}
		for(var i = 0; i < ctx.length; ++i){
			if(!ctx[i].handled){
				uncaught(ctx[i].x);
			}
		}
	}

	function uncaughtHandler(val){
		throw val; // ice.uncaught()
	}
});
