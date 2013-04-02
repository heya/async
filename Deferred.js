(function(factory){
	if(typeof define != "undefined"){ // AMD
		define(["./Micro"], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory(require("./Micro"));
	}
})(function(Micro){
	"use strict";

	function Resolved(x){ this.x = x; }
	function Rejected(x){ this.x = x; }
	function Progress(x){ this.x = x; }

	function CancelError(){}

	function Promise(micro){
		this.micro = micro;
		micro.isPromise = isPromise;
		micro.rebind = makeRebind(this);
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
			this.micro.resolve(new Rejected(typeof reason != "undefined" ? reason : new CancelError()));
			this.canceled = true;
		},
		then: function(callback, errback, progback){
			return new Promise(this.micro.then(makeMultiplexer(callback, errback, progback)));
		},
		done: function(callback, errback, progback){
			this.micro.done(makeMultiplexer(callback, errback, progback));
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
	Deferred.prototype.progress = makeResolver(Progress, true);

	// export

	Deferred.CancelError = CancelError;

	return Deferred;

	// utilities

	function isPromise(val){
		return val.x && typeof val.x.then == "function";
	}

	function makeRebind(host){
		return function(promise){
			promise = promise.x;
			host.canceler = typeof promise.cancel == "function" ?
				function(reason){ promise.cancel(reason); } : function(){};
			promise[typeof promise.done == "function" ? "done" : "then"](
				makeResolver(Resolved).bind(host),
				makeResolver(Rejected).bind(host),
				makeResolver(Progress, true).bind(host));
		};
	}

	function makeMultiplexer(callback, errback, progback){
		if(callback && callback instanceof Deferred){
			return callback.micro.resolve.bind(callback.micro);
		}
		callback = typeof callback == "function" && callback;
		errback  = typeof errback  == "function" && errback;
		progback = typeof progback == "function" && progback;
		return function(val){
			if(val instanceof Progress){
				if(progback){
					try{
						progback(val.x);
					}catch(e){
						// suppress
					}
				}
				return val;
			}
			var cb = val instanceof Resolved && callback || val instanceof Rejected && errback;
			if(cb){
				try{
					val = new Resolved(cb(val.x));
				}catch(e){
					return new Rejected(e);
				}
			}
			return val;
		};
	}

	function makeResolver(Type, isEvent){
		return function(val){
			if(!this.canceled){
				this.micro.resolve(new Type(val), isEvent);
			}
		};
	}
});
