/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../PromiseShimEs6"],
 function(module, unit, PromiseShim){
	"use strict";

	function defCallbacks(t, d, verb){
		return d[verb || "then"](
			function(v){ t.info("callback: " + v); return v; },
			function(v){ t.info("errback: " + v); return v; },
			function(v){ t.info("progback: " + v); return v; }
		);
	}

	var defer = (function(){
			if(typeof process && process.netTick){
				return process.nextTick;
			}
			switch("function"){
				case typeof setImmediate:
					return setImmediate;
				case typeof requestAnimationFrame:
					return requestAnimationFrame;
			}
			return function(a){ setTimeout(a, 4); }
		}());

	unit.add(module, [
		// main tests
		{
			test: function test_def_prog_res(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve, reject, onCancel, progress){
						defer(function(){
							t.info("progress 1");
							progress(1);
							t.info("progress 2");
							progress(2);
							t.info("resolving value");
							resolve("value");
							x.done();
						});
					});
				defCallbacks(t, a);
			},
			logs: [
				"progress 1",
				"progback: 1",
				"progress 2",
				"progback: 2",
				"resolving value",
				"callback: value"
			]
		},
		{
			test: function test_def_prog_rej(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve, reject, onCancel, progress){
						defer(function(){
							t.info("progress 1");
							progress(1);
							t.info("progress 2");
							progress(2);
							t.info("rejecting value");
							reject("value");
							x.done();
						});
					});
				defCallbacks(t, a);
			},
			logs: [
				"progress 1",
				"progback: 1",
				"progress 2",
				"progback: 2",
				"rejecting value",
				"errback: value"
			]
		},
		{
			test: function test_def_rej_pass(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve, reject){
						defer(function(){
							t.info("rejecting error");
							reject("error");
						});
					});
				a.then(
					function(v){ t.info("callback 1: " + v); },
					function(v){ t.info("errback 1: " + v); }
				).done(
					function(v){ t.info("callback 2: " + v); x.done(); },
					function(v){ t.info("errback 2: " + v); x.done(); return v; }
				);
			},
			logs: [
				"rejecting error",
				"errback 1: error",
				"errback 2: error"
			]
		},
/*
		{
			test: function test_def_rej_pass_uncaught(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve, reject){
						defer(function(){
							t.info("rejecting error");
							reject("error");
							x.done();
						});
					});
				a.then(
					function(v){ t.info("callback 1: " + v); },
					function(v){ t.info("errback 1: " + v); }
				).done(
					function(v){ t.info("callback 2: " + v); },
					function(v){ t.info("errback 2: " + v); }
				);
			},
			logs: [
				"rejecting error",
				"errback 1: error",
				"errback 2: error",
				{text: "error", meta: {name: "error"}}
			]
		}
*/
		{
			test: function test_def_rej_res(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve, reject){
						defer(function(){
							t.info("rejecting error");
							reject("error");
						});
					});
				a.then(
					function(v){ t.info("callback 1: " + v); },
					function(v){ t.info("errback 1: " + v); return "value"; }
				).done(
					function(v){ t.info("callback 2: " + v); x.done(); },
					function(v){ t.info("errback 2: " + v); x.done(); }
				);
			},
			logs: [
				"rejecting error",
				"errback 1: error",
				"callback 2: value"
			]
		},
		// clones of micro tests
		{
			test: function test_def_then_resolve(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve){
						defer(function(){
							t.info("resolving");
							resolve("value");
						});
					});
				a.then(function(v){ t.info("callback: " + v); x.done(); });
			},
			logs: [
				"resolving",
				"callback: value"
			]
		},
		{
			test: function test_def_resolve_then(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve){
						t.info("resolving");
						resolve("value");
					});
				a.then(function(v){ t.info("callback: " + v); x.done(); });
			},
			logs: [
				"resolving",
				"callback: value"
			]
		},
		{
			test: function test_def_then2_resolve(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve){
					defer(function(){
						t.info("resolving");
						resolve("value");
					});
				});
				a.then(function(v){ t.info("callback 1: " + v); return v; }).
					then(function(v){ t.info("callback 2: " + v); x.done(); });
			},
			logs: [
				"resolving",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_def_then_pass(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve){
					defer(function(){
						t.info("resolving");
						resolve("value");
					});
				});
				a.then(function(v){ t.info("callback 1: " + v); }).
					done(function(v){ t.info("callback 2: " + v); x.done(); });
			},
			logs: [
				"resolving",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_def_resolve_then2(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve){
						t.info("resolving");
						resolve("value");
					});
				a.then(function(v){ t.info("callback 1: " + v); return v; }).
					then(function(v){ t.info("callback 2: " + v); x.done(); });
			},
			logs: [
				"resolving",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_def_then_resolve_ab(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve){
						defer(function(){
							t.info("resolving a");
							resolve(b);
						});
					}),
					b = new PromiseShim(function(resolve){
						defer(function(){
							t.info("resolving b");
							resolve("value");
						});
					});
				a.then(function(v){ t.info("callback: " + v); x.done(); });
			},
			logs: [
				"resolving a",
				"resolving b",
				"callback: value"
			]
		},
		{
			test: function test_def_then2_resolve_ab(t){
				var x = t.startAsync("async");
				var a = new PromiseShim(function(resolve){
						defer(function(){
							t.info("resolving a");
							resolve("value 1");
						});
					}),
					b = new PromiseShim(function(resolve){
						defer(function(){
							t.info("resolving b");
							resolve("value 2");
						});
					});
				a.then(function(v){ t.info("callback 1: " + v); return b; }).
					then(function(v){ t.info("callback 2: " + v); x.done(); });
			},
			logs: [
				"resolving a",
				"callback 1: value 1",
				"resolving b",
				"callback 2: value 2"
			]
		},
		{
			test: function test_def_then2_resolve_ba(t){
				var x = t.startAsync("async");
				var b = new PromiseShim(function(resolve){
						defer(function(){
							t.info("resolving b");
							resolve("value 2");
						});
					}),
					a = new PromiseShim(function(resolve){
						defer(function(){
							t.info("resolving a");
							resolve("value 1");
						});
					});
				a.then(function(v){ t.info("callback 1: " + v); return b; }).
					then(function(v){ t.info("callback 2: " + v); x.done(); });
			},
			logs: [
				"resolving b",
				"resolving a",
				"callback 1: value 1",
				"callback 2: value 2"
			]
		}
/*
		{
			test: function test_def_par_then2_resolve(t){
				var a = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); });
				a.then(function(v){ t.info("callback 2: " + v); });
				t.info("resolving");
				a.resolve("value");
			},
			logs: [
				"resolving",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_def_par_resolve_then2(t){
				var a = new Deferred();
				t.info("resolving");
				a.resolve("value");
				a.then(function(v){ t.info("callback 1: " + v); });
				a.then(function(v){ t.info("callback 2: " + v); });
			},
			logs: [
				"resolving",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_def_par_then_resolve_ab(t){
				var a = new Deferred(), b = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); });
				a.then(function(v){ t.info("callback 2: " + v); });
				t.info("resolving a");
				a.resolve(b);
				t.info("resolving b");
				b.resolve("value");
			},
			logs: [
				"resolving a",
				"resolving b",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_def_par_then_resolve_ba(t){
				var a = new Deferred(), b = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); });
				a.then(function(v){ t.info("callback 2: " + v); });
				t.info("resolving b");
				b.resolve("value");
				t.info("resolving a");
				a.resolve(b);
			},
			logs: [
				"resolving b",
				"resolving a",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_def_chain_abc(t){
				var a = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); return v; }).
				then(function(v){ t.info("callback 2: " + v); return v; }).
				done(function(v){ t.info("callback 3: " + v); });
				t.info("resolving a");
				a.resolve("value");
			},
			logs: [
				"resolving a",
				"callback 1: value",
				"callback 2: value",
				"callback 3: value"
			]
		},
		{
			test: function test_def_chain_then_resolve_then(t){
				var a = new Deferred(),
					b = a.then(function(v){ t.info("callback 1: " + v); return v + " 2"; });
				t.info("resolving a");
				a.resolve("value");
				b.done(function(v){ t.info("callback 2: " + v); });
			},
			logs: [
				"resolving a",
				"callback 1: value",
				"callback 2: value 2"
			]
		},
		{
			test: function test_def_resolve_a_then2_resolve_b(t){
				var a = new Deferred(), b = new Deferred();
				t.info("resolving a");
				a.resolve("value 1");
				a.then(function(v){ t.info("callback 1: " + v); return b; }).
				then(function(v){ t.info("callback 2: " + v); });
				t.info("resolving b");
				b.resolve("value 2");
			},
			logs: [
				"resolving a",
				"callback 1: value 1",
				"resolving b",
				"callback 2: value 2"
			]
		},
		{
			test: function test_def_resolve_ab_then2(t){
				var a = new Deferred(), b = new Deferred();
				t.info("resolving a");
				a.resolve("value 1");
				t.info("resolving b");
				b.resolve("value 2");
				a.then(function(v){ t.info("callback 1: " + v); return b; }).
				then(function(v){ t.info("callback 2: " + v); });
			},
			logs: [
				"resolving a",
				"resolving b",
				"callback 1: value 1",
				"callback 2: value 2"
			]
		},
		{
			test: function test_def_then_cancel(t) {
				var a = new Deferred( function(v){ t.info("cancelled: " + v); } );
				a.done( function(v){ t.info("callback: " + v); },
					   function(v){ t.info("errback: " + v); } );
				t.info("cancelling a");
				a.cancel( "stop" );
			},
			logs: [
				"cancelling a",
				"cancelled: stop",
				"errback: stop"
			]
		},
		{
			test: function test_def_then_cancel_no_errback(t) {
				var a = new Deferred( function(v){ t.info("cancelled: " + v); } );
				a.done( function(v){ t.info("callback: " + v); } );
				t.info("cancelling a");
				a.cancel( "stop" );
			},
			logs: [
				"cancelling a",
				"cancelled: stop"
			]
		},
		{
			test: function test_def_then_b_then_cancel_a(t) {
				var a = new Deferred( function(v){ t.info("cancelled: " + v); } );
				a.then( function(v){ t.info("callback 1: " + v); },
					   function(v){ t.info("errback 1: " + v); }
					  ).done( function(v){ t.info("callback 2: " + v); },
							 function(v){ t.info("errback 2: " + v); });
				t.info("cancelling a");
				a.cancel( "stop" );
			},
			logs: [
				"cancelling a",
				"cancelled: stop",
				"errback 1: stop",
				"errback 2: stop"
			]
		},
		{
			test: function test_def_then_b_then_cancel_b(t) {
				var a = new Deferred( function(v){ t.info("cancelled: " + v); } ),
					b = a.then( function(v){ t.info("callback 1: " + v); },
							   function(v){ t.info("errback 1: " + v); } );
				b.done( function(v){ t.info("callback 2: " + v); },
					   function(v){ t.info("errback 2: " + v); } );
				t.info("cancelling b");
				b.cancel( "stop" );
			},
			logs: [
				"cancelling b",
				"cancelled: stop",
				"errback 1: stop",
				"errback 2: stop"
			]
		},
		{
			test: function test_def_then_protect_b_then_cancel_b(t) {
				var a = new Deferred( function(v){ t.info("cancelled: " + v); } ),
					b = a.then( function(v){ t.info("callback 1: " + v); },
							   function(v){ t.info("errback 1: " + v); } ).protect();
				b.done( function(v){ t.info("callback 2: " + v); },
					   function(v){ t.info("errback 2: " + v); } );
				t.info("cancelling b");
				b.cancel( "stop" );
				t.info("resolving a");
				a.resolve( "value" );
			},
			logs: [
				"cancelling b",
				"errback 2: stop",
				"resolving a",
				"callback 1: value"
			]
		},
		{
			test: function test_def_protect_reject(t) {
				var a = new Deferred( function(v){ t.info("cancelled: " + v); } );
				a.protect()
					.done(  function(v){ t.info("callback 1: " + v); },
						  function(v){ t.info("errback 1: " + v); return v; } );
				t.info("rejecting a");
				a.reject( "error" );
			},
			logs: [
				"rejecting a",
				"errback 1: error"
			]
		},
		{
			test: function test_def_then_def_cancel(t) {
				var a = new Deferred( function(v){ t.info("cancelled a: " + v); } ),
					b = new Deferred( function(v){ t.info("cancelled b: " + v); } ),
					c = a.then( b );

				b.done( function(v){ t.info("callback 1: " + v); },
					   function(v){ t.info("errback 1: " + v); } );
				c.done( function(v){ t.info("callback 2: " + v); },
					   function(v){ t.info("errback 2: " + v); return v; } );

				t.info("cancelling c");
				c.cancel( "stop" );
			},
			logs: [
				"cancelling c",
				"cancelled a: stop",
				"errback 1: stop",
				"errback 2: stop"
			]
		},
		{
			test: function test_def_reject_to_resolved(t) {
				var a = new Deferred(),
					b = new Deferred();
				a.done( function(v){ t.info("callback: " + v); },
					   function(v){ t.info("errback: " + v); return v; } );
				t.info("rejecting a");
				a.reject( b );
				t.info("resolving b");
				b.resolve( "value" );
			},
			logs: [
				"rejecting a",
				"resolving b",
				"errback: value"
			]
		},
		{
			test: function test_def_reject_to_resolved_sync(t) {
				var a = new Deferred(),
					b = new Deferred();
				a.done( function(v){ t.info("callback: " + v); },
					   function(v){ t.info("errback: " + v); return v; } );
				t.info("resolving b");
				b.resolve( "value" );
				t.info("rejecting a");
				a.reject( b );
			},
			logs: [
				"resolving b",
				"rejecting a",
				"errback: value"
			]
		},
		{
			test: function test_def_reject_to_rejected(t) {
				var a = new Deferred(),
					b = new Deferred();
				a.done( function(v){ t.info("callback: " + v); },
					   function(v){ t.info("errback: " + v); return v; } );
				t.info("rejecting a");
				a.reject( b );
				t.info("rejecting b");
				b.reject( "value" );
			},
			logs: [
				"rejecting a",
				"rejecting b",
				"errback: value"
			]
		},
		{
			test: function test_def_reject_to_rejected_sync(t) {
				var a = new Deferred(),
					b = new Deferred();
				a.done( function(v){ t.info("callback: " + v); },
					   function(v){ t.info("errback: " + v); return v; } );
				t.info("rejecting b");
				b.reject( "value", true );
				t.info("rejecting a");
				a.reject( b );
			},
			logs: [
				"rejecting b",
				"rejecting a",
				"errback: value"
			]
		},
		{
			test: function test_def_resolve_to_rejected(t) {
				var a = new Deferred(),
					b = new Deferred();
				a.done( function(v){ t.info("callback: " + v); },
					   function(v){ t.info("errback: " + v); return v; } );
				t.info("resolving a");
				a.resolve( b );
				t.info("rejecting b");
				b.reject( "value" );
			},
			logs: [
				"resolving a",
				"rejecting b",
				"errback: value"
			]
		},
		{
			test: function test_def_resolve_to_rejected_sync(t) {
				var a = new Deferred(),
					b = new Deferred();
				a.done( function(v){ t.info("callback: " + v); },
					   function(v){ t.info("errback: " + v); return v; } );
				t.info("rejecting b");
				b.reject( "value", true );
				t.info("resolving a");
				a.resolve( b );
			},
			logs: [
				"rejecting b",
				"resolving a",
				"errback: value"
			]
		}
*/
	]);

	return {};
});
