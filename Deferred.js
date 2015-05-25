/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Micro"], function(Micro){
	"use strict";

	function Resolved(x, ctx){
		this.x = x;
		this.ctx = ctx;
	}

	Resolved.prototype = {
		foreignRebindAdapter: function(def, fThen){
			fThen.call(this.x, def.resolve.bind(def), def.reject.bind(def), def.progress.bind(def));
		}
	}

	function Rejected(x, ctx){
		this.x = x;
		this.ctx = ctx;
		ctx.push(this);
	}

	Rejected.prototype = {
		nativeRebindAdapter: function(val){
			return val instanceof Resolved ? new Rejected(val.x, val.ctx) : val;
		},
		foreignRebindAdapter: function(def, fThen){
			fThen.call(this.x, def.reject.bind(def), def.reject.bind(def), def.progress.bind(def));
		}
	}

	function Progress(x){
		this.x = x;
	}

	function CancelError(){}
	CancelError.prototype = {
		toString: function(){ return "[Error: cancelled]" }
	}

	function Promise(micro){
		this.micro = micro;
		micro.rebind = this._rebind.bind(this);
		micro.cancel = this._cancel.bind(this);
	}

	Promise.prototype = {
		declaredClass: "promise/main/Promise",

		cancel: function(reason, uncaught){
			var ctx = [];
			this._cancel(new Rejected(typeof reason === "undefined" ? new CancelError() : reason, ctx));
			processUncaught(ctx.slice(1), uncaught);
		},
		then: function(callback, errback, progback){
			if(callback && callback instanceof Deferred){
				var r = this.then();
				callback.micro.resolve(new Resolved(r));
				return r;
			}
			return new Promise(this.micro.then(makeMultiplexer(callback, errback, progback)));
		},
		done: function(callback, errback, progback){
			if(callback && callback instanceof Deferred){
				callback.micro.resolve(new Resolved(this));
			}else{
				this.micro.done(makeMultiplexer(callback, errback, progback));
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
				try{
					this.canceler(errVal.x);
				}catch(e){
					new Rejected(e, errVal.ctx);
				}
			}

			var ctx = [];
			Micro.prototype.cancel.call(this.micro, new Rejected(errVal.x, ctx));
			errVal.ctx.push.apply(errVal.ctx, ctx.slice(1));
			this.micro.resolve(errVal);
			this.canceled = true;
		}
	};

	function Deferred(canceler){
		// intentionally altering Promise constructor parameters
		Promise.call(this, new Micro());
		this.canceler = canceler;
	}
	Deferred.prototype = Object.create(Promise.prototype);
	Deferred.prototype.declaredClass = "promise/main/Deferred";

	Deferred.prototype.resolve  = makeResolver(Resolved);
	Deferred.prototype.progress = makeResolver(Progress);
	Deferred.prototype.reject   = makeResolver(Rejected);

	Deferred.prototype._rebind = function(val){
		if(Promise.prototype._rebind.call(this, val)){
			return true;
		}
		if(val && val.x && typeof val.x.then == "function"){
			val.foreignRebindAdapter(this, typeof val.x.done == "function" ? val.x.done : val.x.then);
			return true;
		}
		return false;
	};

	// export

	Deferred.CancelError = CancelError;
	Deferred.Promise = Promise;

	return Deferred;

	// utilities

	function makeMultiplexer(callback, errback, progback){
		callback = typeof callback == "function" && callback;
		errback  = typeof errback  == "function" && errback;
		progback = typeof progback == "function" && progback;

		return function(val){
			if(val instanceof Progress){
				if(progback){
					try{
						progback(val.x);
					}catch(e){}	// suppress
				}
				return val;
			}

			var cb = val instanceof Resolved && callback ||
						val instanceof Rejected && errback;
			if(cb){
				try{
					var v = cb(val.x);
					if(typeof v != "undefined"){
						if(val instanceof Rejected){
							val.handled = true;
						}
						return new Resolved(v);
					}
				}catch(e){
					if(val instanceof Rejected){
						val.handled = true;
					}
					return new Rejected(e, val.ctx);
				}
			}

			return val;
		};
	}

	function makeResolver(Type) {
		return Type === Progress ?
			function(val) {
				if(!this.canceled){
					this.micro.resolve(new Progress(val), true);
				}
			} :
			function(val, uncaught){
				if(!this.canceled){
					var ctx = [];
					this.micro.resolve(new Type(val, ctx));
					processUncaught(ctx, uncaught);
				}
			};
	}

	function processUncaught(ctx, uncaught){
		if(typeof uncaught !== "function"){
			uncaught = uncaught ? function(){} : uncaughtHandler;
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
