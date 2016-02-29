/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../Deferred"],
function(module, unit, Deferred){
	"use strict";

	unit.add(module, [
		// working with native deferreds
		{
			test: function test_native_deferreds_resolve(t){
				var a = new Deferred(), b = new Deferred();
				a.done(function(v){ t.info("callback 1: " + v); return v + "-a"; },
					function(v){ t.info("errback 1: " + v); return v + "-a"; },
					function(v){ t.info("progback 1: " + v); return v + "-a"; });
				b.done(function(v){ t.info("callback 2: " + v); return v + "-b"; },
					function(v){ t.info("errback 2: " + v); return v + "-b"; },
					function(v){ t.info("progback 2: " + v); return v + "-b"; });
				a.done(b);
				t.info("progress a");
				a.progress("v1");
				t.info("progress a");
				a.progress("v2");
				t.info("resolving a");
				a.resolve("value");
			},
			logs: [
				"progress a",
				"progback 1: v1",
				"progback 2: v1",
				"progress a",
				"progback 1: v2",
				"progback 2: v2",
				"resolving a",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_native_deferreds_resolve_seq(t){
				var a = new Deferred(), b = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); return v + "-a"; },
						function(v){ t.info("errback 1: " + v); return v + "-a"; },
						function(v){ t.info("progback 1: " + v); return v + "-a"; }).
					done(b);
				b.done(function(v){ t.info("callback 2: " + v); return v + "-b"; },
					function(v){ t.info("errback 2: " + v); return v + "-b"; },
					function(v){ t.info("progback 2: " + v); return v + "-b"; });
				t.info("progress a");
				a.progress("v1");
				t.info("progress a");
				a.progress("v2");
				t.info("resolving a");
				a.resolve("value");
			},
			logs: [
				"progress a",
				"progback 1: v1",
				"progback 2: v1",
				"progress a",
				"progback 1: v2",
				"progback 2: v2",
				"resolving a",
				"callback 1: value",
				"callback 2: value-a"
			]
		},
		{
			test: function test_native_deferreds_reject(t){
				var a = new Deferred(), b = new Deferred();
				a.done(function(v){ t.info("callback 1: " + v); return v + "-a"; },
					function(v){ t.info("errback 1: " + v); return v + "-a"; },
					function(v){ t.info("progback 1: " + v); return v + "-a"; });
				b.done(function(v){ t.info("callback 2: " + v); return v + "-b"; },
					function(v){ t.info("errback 2: " + v); return v + "-b"; },
					function(v){ t.info("progback 2: " + v); return v + "-b"; });
				a.done(b);
				t.info("progress a");
				a.progress("v1");
				t.info("progress a");
				a.progress("v2");
				t.info("rejecting a");
				a.reject("value");
			},
			logs: [
				"progress a",
				"progback 1: v1",
				"progback 2: v1",
				"progress a",
				"progback 1: v2",
				"progback 2: v2",
				"rejecting a",
				"errback 1: value",
				"errback 2: value"
			]
		},
		{
			test: function test_native_deferreds_reject_seq(t){
				var a = new Deferred(), b = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); return v + "-a"; },
						function(v){ t.info("errback 1: " + v); return v + "-a"; },
						function(v){ t.info("progback 1: " + v); return v + "-a"; }).
					done(b);
				b.done(function(v){ t.info("callback 2: " + v); return v + "-b"; },
					function(v){ t.info("errback 2: " + v); return v + "-b"; },
					function(v){ t.info("progback 2: " + v); return v + "-b"; });
				t.info("progress a");
				a.progress("v1");
				t.info("progress a");
				a.progress("v2");
				t.info("rejecting a");
				a.reject("value");
			},
			logs: [
				"progress a",
				"progback 1: v1",
				"progback 2: v1",
				"progress a",
				"progback 1: v2",
				"progback 2: v2",
				"rejecting a",
				"errback 1: value",
				"callback 2: value-a"
			]
		},
		{
			test: function test_native_deferreds_reject_throw(t){
				var a = new Deferred(), b = new Deferred(),
					old = Deferred.detectUncaught;
				Deferred.detectUncaught = true;
				a.done(function(v){ t.info("callback 1: " + v); return v + "-a"; },
					function(v){ t.info("errback 1: " + v); return v + "-a"; },
					function(v){ t.info("progback 1: " + v); return v + "-a"; });
				b.done(function(v){ t.info("callback 2: " + v); return v + "-b"; },
					function(v){ t.info("errback 2: " + v); throw v + "-b"; },
					function(v){ t.info("progback 2: " + v); return v + "-b"; });
				a.done(b);
				t.info("progress a");
				a.progress("v1");
				t.info("progress a");
				a.progress("v2");
				t.info("rejecting a");
				try{
					a.reject("value");
				}finally{
					Deferred.detectUncaught = old;
				}
			},
			logs: [
				"progress a",
				"progback 1: v1",
				"progback 2: v1",
				"progress a",
				"progback 1: v2",
				"progback 2: v2",
				"rejecting a",
				"errback 1: value",
				"errback 2: value",
				{text: "value-b", meta: {name: "error"}}
			]
		},
		{
			test: function test_native_deferreds_reject_seq_throw(t){
				var a = new Deferred(), b = new Deferred(),
					old = Deferred.detectUncaught;
				Deferred.detectUncaught = true;
				a.then(function(v){ t.info("callback 1: " + v); return v + "-a"; },
						function(v){ t.info("errback 1: " + v); throw v + "-a"; },
						function(v){ t.info("progback 1: " + v); return v + "-a"; }).
					done(b);
				b.done(function(v){ t.info("callback 2: " + v); return v + "-b"; },
					function(v){ t.info("errback 2: " + v); throw v + "-b"; },
					function(v){ t.info("progback 2: " + v); return v + "-b"; });
				t.info("progress a");
				a.progress("v1");
				t.info("progress a");
				a.progress("v2");
				t.info("rejecting a");
				try{
					a.reject("value");
				}finally{
					Deferred.detectUncaught = old;
				}
			},
			logs: [
				"progress a",
				"progback 1: v1",
				"progback 2: v1",
				"progress a",
				"progback 1: v2",
				"progback 2: v2",
				"rejecting a",
				"errback 1: value",
				"errback 2: value-a",
				{text: "value-a-b", meta: {name: "error"}}
			]
		},
		{
			test: function test_native_deferreds_resolve_throw(t){
				var a = new Deferred(), b = new Deferred(),
					old = Deferred.detectUncaught;
				Deferred.detectUncaught = true;
				a.done(function(v){ t.info("callback 1: " + v); },
					function(v){ t.info("errback 1: " + v); throw v + "-a"; },
					function(v){ t.info("progback 1: " + v); throw v + "-a"; });
				b.done(function(v){ t.info("callback 2: " + v); throw v + "-b"; },
					function(v){ t.info("errback 2: " + v); throw v + "-b"; },
					function(v){ t.info("progback 2: " + v); throw v + "-b"; });
				a.done(b);
				t.info("progress a");
				a.progress("v1");
				t.info("progress a");
				a.progress("v2");
				t.info("resolving a");
				try{
					a.resolve("value");
				}finally{
					Deferred.detectUncaught = old;
				}
			},
			logs: [
				"progress a",
				"progback 1: v1",
				"progback 2: v1",
				"progress a",
				"progback 1: v2",
				"progback 2: v2",
				"resolving a",
				"callback 1: value",
				"callback 2: value",
				{text: "value-b", meta: {name: "error"}}
			]
		},
		{
			test: function test_native_deferreds_resolve_seq_throw(t){
				var a = new Deferred(), b = new Deferred(),
					old = Deferred.detectUncaught;
				Deferred.detectUncaught = true;
				a.then(function(v){ t.info("callback 1: " + v); throw v + "-a"; },
						function(v){ t.info("errback 1: " + v); throw v + "-a"; },
						function(v){ t.info("progback 1: " + v); throw v + "-a"; }).
					done(b);
				b.done(function(v){ t.info("callback 2: " + v); throw v + "-b"; },
					function(v){ t.info("errback 2: " + v); throw v + "-b"; },
					function(v){ t.info("progback 2: " + v); throw v + "-b"; });
				t.info("progress a");
				a.progress("v1");
				t.info("progress a");
				a.progress("v2");
				t.info("resolving a");
				try{
					a.resolve("value");
				}finally{
					Deferred.detectUncaught = old;
				}
			},
			logs: [
				"progress a",
				"progback 1: v1",
				"progback 2: v1",
				"progress a",
				"progback 1: v2",
				"progback 2: v2",
				"resolving a",
				"callback 1: value",
				"errback 2: value-a",
				{text: "value-a-b", meta: {name: "error"}}
			]
		},
		{
			test: function test_cancel_a(t){
				var a = new Deferred(
						function(reason){ t.info("cancel 1: " + reason); return reason + "-x"; });
				a.done(function(v){ t.info("callback 1: " + v); return v + "-a"; },
					function(v){ t.info("errback 1: " + v); return v + "-a"; },
					function(v){ t.info("progback 1: " + v); });
				var b = new Deferred(
						function(reason){ t.info("cancel 2: " + reason); return reason + "-y"; });
				b.done(function(v){ t.info("callback 2: " + v); return v + "-b"; },
					function(v){ t.info("errback 2: " + v); return v + "-b"; },
					function(v){ t.info("progback 2: " + v); });
				t.info("resolving b with a");
				b.resolve(a);
				t.info("canceling a");
				a.cancel("value");
			},
			logs: [
				"resolving b with a",
				"canceling a",
				"cancel 1: value",
				"errback 1: value",
				"errback 2: value"
			]
		},
		{
			test: function test_simple_reject(t){
				var a = new Deferred(), old = Deferred.detectUncaught;
				Deferred.detectUncaught = true;
				a.done( function(v){ t.info( "callback: " + v ); } );
				t.info("rejecting a");
				try{
					a.reject("value");
				}finally{
					Deferred.detectUncaught = old;
				}
			},
			logs: [
				"rejecting a",
				{text: "value", meta: {name: "error"}}
			]
		},
		{
			test: function test_throw_promise(t) {
				var a = new Deferred(),
					b = new Deferred();
				a.then( function(v){
					t.info("callback 1: " + v);
					throw b;
				} )
				.done( null, function(v){
					t.info("errback 2: " + v);
					return v;
				} );

				t.info( "resolving a" );
				a.resolve( "value 1" );
				t.info( "resolving b" );
				b.resolve( "value 2" );
			},
			logs: [
				"resolving a",
				"callback 1: value 1",
				"resolving b",
				"errback 2: value 2"
			]
		}
	]);

	return {};
});
