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

	function Promise(micro){ this.micro = micro; }

	Promise.prototype = {
		declaredClass: "promise/main/Promise",
		cancel: function(reason){
			if(this.micro.host && this.micro.host.canceler){
				try{
					var r = this.micro.host.canceler(reason);
					if(typeof r != "undefined"){ reason = r; }
				}catch(e){
					reason = e;
				}
			}
			this.micro.resolve(new Rejected(typeof reason != "undefined" ? reason : new CancelError()));
			this.micro.canceled = true;
		},
		then: function(callback, errback, progback){
			return new Promise(callback && callback instanceof Deferred ?
				this.micro.then(callback.micro.resolve.bind(callback)) :
				this.micro.then(Multiplexer(callback, errback, progback)));
		},
		done: function(callback, errback, progback){
			this.micro.done(Multiplexer(callback, errback, progback));
		}
	};

	function Deferred(canceler){
		this.micro = new Micro();
		this.micro.host = this;
		this.canceler = canceler;
	}
	Deferred.prototype = Object.create(Promise.prototype);
	Deferred.prototype.declaredClass = "promise/main/Deferred";

	Deferred.prototype.resolve = makeResolver(Resolved);
	Deferred.prototype.reject  = makeResolver(Rejected);

	Deferred.prototype.progress = function(val){
		if(!this.micro.canceled){
			//assert(!("value" in this.micro));
			this.micro.resolve(new Progress(val), true);
		}
	};

	// export

	Deferred.CancelError = CancelError;

	return Deferred;

	// utilities

	function Multiplexer(callback, errback, progback){
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

	function makeResolver(Type){
		return function(val){
			if(!this.micro.canceled){
				//assert(!("value" in this.micro));
				if(val && typeof val.then == "function"){
					// hook on an external promise
					this.micro.host.canceler = typeof val.cancel == "function" ?
						function(reason){ val.cancel(reason); } : function(){};
					val[typeof val.done == "function" ? "done" : "then"](
						this.resolve.bind(this), this.reject.bind(this), this.progress.bind(this));
				}else{
					this.micro.resolve(new Type(val));
				}
			}
		};
	}
});
