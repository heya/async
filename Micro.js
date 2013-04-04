/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-ice/assert"], function(module, ice){
	"use strict";

	ice = ice.specialize(module);

	// Based on Max' micro-deferred: https://gist.github.com/MaxMotovilov/4750596

	function Micro(val,cb){
		if(val instanceof Micro) {
			ice.assert(typeof cb == "function", "Attempt to improperly construct a promise");
			this.parent = val;
			this.parentChainIndex = this.parent.chain.length;
			this.parent.chain.push(cb);
		} else if(arguments.length) {
			this.value = val;
		} else {
			this.chain = [];
		}
	}

	Micro.prototype = {
		declaredClass: "promise/micro/Micro",

		rebind: function(val){
			return val instanceof Micro && ( val.done( this.resolve.bind( this ) ) || true );
		},

		resolve: function(val, isEvent){
			ice.assert(!("value" in this), "Attempt to resolve an already resolved promise.");
			ice.assert(!("parent" in this), "Attempt to directly resolve a dependent promise");
			ice.assert(this.chain, "BUG: malformed promise object");

			if( isEvent || !this.rebind( val ) ) {
				for(var i = 0; i < this.chain.length; ++i)
					this.chain[i](val, isEvent);

				if(!isEvent){
					this.value = val;
					delete this.chain;
				}
			}
		},

		then: function(cb){
			if("value" in this) {
				var value = cb( this.value );
				return value instanceof Micro ? value : new Micro( value );
			}

			this.connect();

			return new Micro( this, cb );
		},

		done: function(cb){
			if("value" in this) {
				cb(this.value);
			} else {
				this.connect();
				this.chain.push( cb );
			}
		},

		connect: function() {
			if( this.parent ) {
				this.parent.chain[ this.parentChainIndex ] =
					callAndForward( this.parent.chain[ this.parentChainIndex ], this );
				delete this.parent;
				delete this.parentChainIndex;
				this.chain = [];
			}
		}
	};

	return Micro;

	function callAndForward( cb, promise ) {
		return function( val, isEvent ) {
			promise.resolve( cb( val ), isEvent );
		}
	}
});

