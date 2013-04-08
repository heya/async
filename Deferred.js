/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["./Micro"], function(Micro){
	"use strict";

	function Resolved(x){ 
		this.x = x; 
	}

	Resolved.prototype = {
		foreignRebindAdapter: function( def, fThen ) {
			fThen.call( this.x, def.resolve.bind(def), def.reject.bind(def), def.progress.bind(def) );
		}
	}

	function Rejected(x,cancel){ 
		this.x = x; 
		if( cancel ) this.cancel = cancel;
	}

	Rejected.prototype = {
		nativeRebindAdapter: function(val) {
			if( val instanceof Progress ) 
				return val;
			else
				return new Rejected(val.x);
		},

		foreignRebindAdapter: function( def, fThen ) {
			fThen.call( this.x, def.reject.bind(def), def.reject.bind(def), def.progress.bind(def) );
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
		micro.cancel = this.cancel.bind(this);
	}

	Promise.prototype = {
		declaredClass: "promise/main/Promise",
		cancel: function(reason){
			if(this.canceler){
				try{
					this.canceler(reason);
				}catch(e){
					throw e; // ice.uncaught( e );
				}
			}
		
			if(typeof reason == "undefined")
				reason = new CancelError();

			Micro.prototype.cancel.call(this.micro,reason);
			this.micro.resolve(new Rejected(reason,true));
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
			var adapter;
			return val && val.x instanceof Promise &&
				   Micro.prototype.rebind.call(this.micro, val.x.micro, val.nativeRebindAdapter);
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
			val.foreignRebindAdapter &&
			// both assignments below are intentional
			(typeof (then = val.x.done) == "function" ||
			 typeof (then = val.x.then) == "function") &&
			( val.foreignRebindAdapter( this, then ), true );
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
		return function(val,notLast){
			if(val instanceof Progress){
				if(progback){
					try{
						progback(val.x);
					}catch(e){}	// suppress
				}
				return val;
			}
			var err, cb = val instanceof Resolved && callback ||
					 	  val instanceof Rejected && (err = val.x, errback );
			if(cb){
				try{
					var v = cb(val.x);
					return typeof v == "undefined" ? val : new Resolved(v);
				}catch(e){
					if( notLast )
						return new Rejected(e);
					else
						err = e;
				}
			}

			if( err && !val.cancel )
				throw err; // ice.uncaught( err );
			else
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
