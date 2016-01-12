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

	function PromiseBase(micro){
		this.micro = micro;
		micro.rebind = this._rebind.bind(this);
		micro.cancel = this._cancel.bind(this);
	}

	PromiseBase.prototype = {
		declaredClass: "heya-async/es6shim/PromiseBase",

		cancel: function(reason, uncaught){
			var ctx = [];
			this._cancel(new Rejected(typeof reason === "undefined" ? new CancelError() : reason, ctx));
			processUncaught(ctx.slice(1), uncaught);
		},
		then: function(callback, errback, progback){
			if(callback instanceof PromiseImpl){
				var r = this.then();
				callback.micro.resolve(new Resolved(r));
				return r;
			}
			return new PromiseBase(this.micro.then(makeCallback(callback, errback, progback)));
		},
		done: function(callback, errback, progback){
			if(callback instanceof PromiseImpl){
				callback.micro.resolve(new Resolved(this));
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
			if(val && val.x instanceof PromiseBase &&
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

	function PromiseImpl(executor){
		// intentionally altering PromiseBase constructor parameters
		PromiseBase.call(this, new Micro());

		var self = this;

		function resolve(val, uncaught){
			if(!self.canceled){
				var ctx = [];
				self.micro.resolve(new Resolved(val, ctx));
				processUncaught(ctx, uncaught);
			}
		}

		function reject(val, uncaught){
			if(!self.canceled){
				var ctx = [];
				self.micro.resolve(new Rejected(val, ctx));
				processUncaught(ctx, uncaught);
			}
		}

		function progress(val) {
			if(!self.canceled){
				self.micro.resolve(new Progress(val), true);
			}
		}

		function onCancel(canceler){
			self.canceler = canceler;
		}

		this._rebind = function(val){
			if(PromiseBase.prototype._rebind.call(self, val)){
				return true;
			}
			if(val && val.x && typeof val.x.then == "function"){
				val.x[typeof val.x.done == "function" ? "done" : "then"](resolve, reject, progress);
				return true;
			}
			return false;
		};

		executor(resolve, reject, onCancel, progress);
	}
	PromiseImpl.prototype = Object.create(PromiseBase.prototype);
	PromiseImpl.prototype.declaredClass = "promise/es6shim/PromiseImpl";

	// export

	PromiseImpl.CancelError = CancelError;
	PromiseImpl.PromiseBase = PromiseBase;

	return PromiseImpl;

	// utilities

	function makeCallback(callback, errback, progback){
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
						if(v instanceof PromiseBase){
							return v.micro;
						}
						if(v && typeof v.then == "function"){
							var d = new PromiseImpl();
							d.resolve(v);
							return d.micro;
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
