/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Micro"], function(Micro){
	"use strict";

	function Resolved(x){ this.x = x; }
	function Rejected(x){ this.x = x; }
	function Progress(x){ this.x = x; }

	function CancelError(){}

	function Promise(micro){
		this.micro = micro;
		micro.rebind = this._rebind.bind(this);
		micro.cancel = this.cancel.bind(this);
	}

	Promise.prototype = {
		declaredClass: "promise/main/Promise",
		cancel: function(reason){
			if(this.canceler){
				try{
					var r = this.canceler(reason);
					if(typeof r != "undefined"){ reason = r; }
				}catch(e){
					reason = e;
				}
			}
		
			if(typeof reason == "undefined")
				reason = new CancelError();

			Micro.prototype.cancel.call(this.micro,reason);
			this.micro.resolve(new Rejected(reason));
			this.canceled = true;
		},
		then: function(callback, errback, progback){
			if(callback && callback instanceof Deferred){
				var r = this.then();
				callback.micro.resolve( new Resolved( r ) );
				return r;
			}			
			return new Promise(this.micro.then(makeMultiplexer(callback, errback, progback)));
		},
		done: function(callback, errback, progback){
			if(callback && callback instanceof Deferred)
				callback.micro.resolve( new Resolved( this ) );
			else
				this.micro.done(makeMultiplexer(callback, errback, progback));
		},
		protect: function() {
			this.done();
			return this.then();
		},
		_rebind: function( val ) {
			return val && val.x instanceof Promise && Micro.prototype.rebind.call(this.micro, val.x.micro);
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
	Deferred.prototype.reject   = makeResolver(Rejected);
	Deferred.prototype.progress = makeResolver(Progress);

	Deferred.prototype._rebind = function(val){
		var	then;
		return Promise.prototype._rebind.call(this, val) ||
			val && val.x &&
			// both assignments below are intentional
			(typeof (then = val.x.done) == "function" ||
				typeof (then = val.x.then) == "function") &&
			then.call(val.x, this.resolve.bind(this),
				this.reject.bind(this), this.progress.bind(this));
	};

	// export

	Deferred.CancelError = CancelError;

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
					return typeof v == "undefined" ? val : new Resolved(v);
				}catch(e){
					return new Rejected(e);
				}
			}
			return val;
		};
	}

	function makeResolver(Type){
		var isEvent = Type === Progress;
		return function(val){
			if(!this.canceled){
				this.micro.resolve(new Type(val), isEvent);
			}
		};
	}
});
