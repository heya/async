/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-ice/assert"], function(module, ice){
	"use strict";

	ice = ice.specialize(module);

	// Based on Max' micro-deferred: https://gist.github.com/MaxMotovilov/4750596

	function Micro(val) {
		ice.assert( !(val instanceof Micro), "Attempt to improperly construct a dependent promise" );

		if(val instanceof Callback) {
			this.parent = val;			// State W: Weak promise
		} else if( arguments.length ) {
			this.value = val;			// State R: Resolved promise
		} else {
			this.chain = [];			// State P: Regular promise
		}
	}

	Micro.prototype = {
		declaredClass: "promise/micro/Micro",

		rebind: function(val){
			return val instanceof Micro && (val.done(this.resolve.bind(this)) || true);
		},

		resolve: function(val, isEvent) {
			// ASSERT( state == P )
			ice.assert(!("value" in this) && !("parent" in this) && this.chain, "Promise cannot be resolved" );

			if( isEvent || !this.rebind(val) ) {
				for(var i=0; i<this.chain.length; ++i)
					this.chain[i].resolve( val, isEvent );
					
				if(!isEvent) {
					// state: P -> R
					this.value = val;
					delete this.chain;
				}
			}
		},

		then: function(cb) {
			if( "value" in this || !this.addCallback(cb) ) {
				var value = cb(this.value);
				return value instanceof Micro ? value : new Micro(value);
			} else {
				return new Micro( this.chain[this.chain.length-1] );
			}
		},

		done: function(cb) {
			if( "value" in this || !this.addCallback(cb) )
				cb(this.value);
		},

		addCallback: function(cb) {
			if( "parent" in this ) {
				var parent = this.parent;
				delete this.parent;

				if( "value" in parent ) {
					// state: W -> R
					this.value = parent.value;
					return false;
				}

				// state: W -> P
				parent.promise = this;
				this.chain = [];
			}

			this.chain.push( new Callback(cb) );
			return true;
		}
	};

	function Callback(cb) {
		this.callback = cb;
	}

	Callback.prototype = {
		resolve: function(val, isEvent) {
			var value = this.callback(val);
			if( this.promise ) {
				this.promise.resolve( value, isEvent );
				if( !isEvent ) 
					delete this.promise;
			} else if( !isEvent ) {
				this.value = value;
			}
		}
	};

	return Micro;	
});
