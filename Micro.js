(function(factory){
	if(typeof define != "undefined"){ // AMD
		define([], factory);
	}else if(typeof module != "undefined"){ // node.js
		module.exports = factory();
	}
})(function(){
	"use strict";

	// Based on Max' micro-deferred: https://gist.github.com/MaxMotovilov/4750596

	function Micro(val, cb){
		if(val && val instanceof Micro){
			this.parent = val;
			this.callback = cb;
		}else if(arguments.length){
			this.value = val;
		}
		this.chain = [];
	}

	Micro.prototype = {
		declaredClass: "promise/micro/Micro",
		notify: function(val, isEvent){
			if(this.chain){
				for(var i = 0; i < this.chain.length; ++i){
					this.chain[i](val, isEvent);
				}
				if(!isEvent){
					this.value = val;
					delete this.parent;
					delete this.chain;
				}
			}
		},
		resolve: function(val, isEvent){
			if(val && val instanceof Micro){
				val.then(this.resolve.bind(this));
			}else{
				this.notify(this.callback ? this.callback(val) : val, isEvent);
			}
		},
		then: function(cb){
			if("value" in this){
				return new Micro(cb(this.value));
			}
			var micro = new Micro(this, cb);
			this.chain.push(micro.resolve.bind(micro));
			return micro;
		},
		done: function(cb){
			if("value" in this){
				cb(this.value);
			}else{
				this.chain.push(cb);
			}
		}
	};

	return Micro;
});
