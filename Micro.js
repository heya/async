/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-ice/assert"], function(module, ice){
	"use strict";

	ice = ice.specialize(module);

	// Based on Max' micro-deferred: https://gist.github.com/MaxMotovilov/4750596

	function Micro(val){
		ice.assert(!(val instanceof Micro), "Attempt to improperly construct a promise");

		if(val instanceof Callback){
			this.parent = val;		// State W: Weak promise
		}else if(arguments.length){
			this.value = val;		// State R: Resolved promise
		}else{
			this.chain = [];		// State P': Regular, independent promise
		}
	}

	Micro.prototype = {
		declaredClass: "promise/micro/Micro",

		rebind: function(val, adapter){
			if(!(val instanceof Micro)){
				return false;
			}

			if("value" in val || !val.addCallback(adapter || doNothing)){
				this.value = adapter ? adapter(val.value) : val.value; // Enter transitional state
			}else{
				(this.parent = val.chain[val.chain.length - 1]).promise = this;
			}

			return true;
		},

		resolve: function(val, isEvent){
			// ASSERT( state == P )
			ice.assert(!("value" in this) && this.chain, "Promise cannot be resolved");

			if(!isEvent && this.rebind(val)){
				if("value" in this){
					val = this.value;	// Exit transitional state
					delete this.value;
				}else{
					return;
				}
			}

			for(var i = 0; i < this.chain.length; ++i){
				this.chain[i].resolve(val, isEvent);
			}

			if(!isEvent){
				// state: P/P' -> R
				this.value = val;
				delete this.chain;
				delete this.parent;
			}
		},

		then: function(cb){
			if("value" in this || !this.addCallback(cb)){
				var value = cb(this.value);
				return value instanceof Micro ? value : new Micro(value);
			}
			return new Micro(this.chain[this.chain.length - 1]);
		},

		done: function(cb){
			if("value" in this || !this.addCallback(cb)){
				cb(this.value);
			}
		},

		addCallback: function(cb){
			if(!this.chain){
				ice.assert("parent" in this, "Malformed promise state");

				if("value" in this.parent){
					// state: W -> R
					this.value = this.parent.value;
					delete this.parent;
					return false;
				}

				// state: W -> P
				this.parent.promise = this;
				this.chain = [];
			}
			this.chain.push(new Callback(cb, this));
			return true;
		},

		cancel: function(arg){
			if(this.parent){
				delete this.parent.promise;
				if(this.parent.parent.chain.length == 1){
					this.parent.parent.cancel(arg);
				}
			}
		}
	};

	function Callback(cb, parent){
		this.callback = cb;
		this.parent = parent;
	}

	Callback.prototype = {
		resolve: function(val, isEvent){
			val = this.callback(val);
			delete this.parent;
			if(this.promise){
				this.promise.resolve(val, isEvent);
				if(!isEvent){
					delete this.promise;
				}
			}else if(!isEvent){
				this.value = val;
			}
		}
	};

	return Micro;

	function doNothing(v){ return v; }
});
