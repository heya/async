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

	function CancelError(x){ this.x = x; }

	function Promise(micro){
		this.micro = micro;
	}

	function Multiplexer(callback, errback, progback){
		return function(val){
			if(val instanceof Resolved){
				if(callback){
					try{
						val.x = callback(val.x);
					}catch(e){
						return new Rejected(e);
					}
				}
				return val;
			}
			if(val instanceof Rejected){
				if(errback){
					try{
						return new Resolved(errback(val.x));
					}catch(e){
						val.x = e;
					}
				}
				return val;
			}
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
		};
	}

	Promise.prototype = {
		declaredClass: "promise/main/Promise",
		cancel: function(reason){
			if(this.micro.host && this.micro.host.canceler){
				reason = this.micro.host.canceler(reason);
			}
			this.micro.resolve(new Rejected(new CancelError(reason)));
			this.micro.canceled = true;
		},
		then: function(callback, errback, progback){
			return new Promise(this.micro.then(Multiplexer(callback, errback, progback)));
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

	Deferred.prototype.resolve = function(val){
		if(!this.micro.canceled){
			//assert(!("value" in this.micro));
			this.micro.resolve(new Resolved(val));
		}
	};

	Deferred.prototype.reject = function(val){
		if(!this.micro.canceled){
			//assert(!("value" in this.micro));
			this.micro.resolve(new Rejected(val));
		}
	};

	Deferred.prototype.progress = function(val){
		if(!this.micro.canceled){
			//assert(!("value" in this.micro));
			this.micro.resolve(new Progress(val), true);
		}
	};

	// export

	Deferred.CancelError = CancelError;

	return Deferred;
});
