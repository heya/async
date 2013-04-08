/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../Deferred"],
function(module, unit, Deferred){
	"use strict";

	function defCallbacks(t, d, verb){
		return d[verb || "then"](
				function(v){ t.info("callback: " + v); return v; },
				function(v){ t.info("errback: " + v); return v; },
				function(v){ t.info("progback: " + v); return v; }
			);
	}

	unit.add(module, [
		// main tests
		{
			test: function test_def_prog_res(t){
				var a = new Deferred();
				defCallbacks(t, a);
				t.info("progress 1");
				a.progress(1);
				t.info("progress 2");
				a.progress(2);
				t.info("resolving value");
				a.resolve("value");
			},
			logs: [
				{text: "progress 1"},
				{text: "progback: 1"},
				{text: "progress 2"},
				{text: "progback: 2"},
				{text: "resolving value"},
				{text: "callback: value"}
			]
		},
		{
			test: function test_def_prog_rej(t){
				var a = new Deferred();
				defCallbacks(t, a);
				t.info("progress 1");
				a.progress(1);
				t.info("progress 2");
				a.progress(2);
				t.info("rejecting value");
				a.reject("value");
			},
			logs: [
				{text: "progress 1"},
				{text: "progback: 1"},
				{text: "progress 2"},
				{text: "progback: 2"},
				{text: "rejecting value"},
				{text: "errback: value"}
			]
		},
		{
			test: function test_def_rej_pass(t){
				var a = new Deferred();
				a.then( function(v){ t.info("callback 1: " + v); },
						function(v){ t.info("errback 1: " + v); } )
				 .done( function(v){ t.info("callback 2: " + v); },
						function(v){ t.info("errback 2: " + v); } );
				t.info("rejecting error");
				a.reject("error");
			},
			logs: [
				{text: "rejecting error"},
				{text: "errback 1: error"},
				{text: "errback 2: error"}
			]
		},
		{
			test: function test_def_rej_res(t){
				var a = new Deferred();
				a.then( function(v){ t.info("callback 1: " + v); },
						function(v){ t.info("errback 1: " + v); return "value"; } )
				 .done( function(v){ t.info("callback 2: " + v); },
						function(v){ t.info("errback 2: " + v); } );
				t.info("rejecting error");
				a.reject("error");
			},
			logs: [
				{text: "rejecting error"},
				{text: "errback 1: error"},
				{text: "callback 2: value"}
			]
		},
		// clones of micro tests
		{
			test: function test_def_then_resolve(t){
				var a = new Deferred();
				a.then(function(v){ t.info("callback: " + v); });
				t.info("resolving");
				a.resolve("value");
			},
			logs: [
				{text: "resolving"},
				{text: "callback: value"}
			]
		},
		{
			test: function test_def_resolve_then(t){
				var a = new Deferred();
				t.info("resolving");
				a.resolve("value");
				a.then(function(v){ t.info("callback: " + v); });
			},
			logs: [
				{text: "resolving"},
				{text: "callback: value"}
			]
		},
		{
			test: function test_def_then2_resolve(t){
				var a = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); return v; })
				 .then(function(v){ t.info("callback 2: " + v); });
				t.info("resolving");
				a.resolve("value");
			},
			logs: [
				{text: "resolving"},
				{text: "callback 1: value"},
				{text: "callback 2: value"}
			]
		},
		{
			test: function test_def_then_pass(t){
				var a = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); })
				 .done(function(v){ t.info("callback 2: " + v); });
				t.info("resolving");
				a.resolve("value");
			},
			logs: [
				{text: "resolving"},
				{text: "callback 1: value"},
				{text: "callback 2: value"}
			]
		},
		{
			test: function test_def_resolve_then2(t){
				var a = new Deferred();
				t.info("resolving");
				a.resolve("value");
				a.then(function(v){ t.info("callback 1: " + v); return v; }).
					then(function(v){ t.info("callback 2: " + v); });
			},
			logs: [
				{text: "resolving"},
				{text: "callback 1: value"},
				{text: "callback 2: value"}
			]
		},
		{
			test: function test_def_then_resolve_ab(t){
				var a = new Deferred(), b = new Deferred();
				a.then(function(v){ t.info("callback: " + v); });
				t.info("resolving a");
				a.resolve(b);
				t.info("resolving b");
				b.resolve("value");
			},
			logs: [
				{text: "resolving a"},
				{text: "resolving b"},
				{text: "callback: value"}
			]
		},
		{
			test: function test_def_then2_resolve_ab(t){
				var a = new Deferred(), b = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); return b; }).
					then(function(v){ t.info("callback 2: " + v); });
				t.info("resolving a");
				a.resolve("value 1");
				t.info("resolving b");
				b.resolve("value 2");
			},
			logs: [
				{text: "resolving a"},
				{text: "callback 1: value 1"},
				{text: "resolving b"},
				{text: "callback 2: value 2"}
			]
		},
		{
			test: function test_def_then2_resolve_ba(t){
				var a = new Deferred(), b = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); return b; }).
					then(function(v){ t.info("callback 2: " + v); });
				t.info("resolving b");
				b.resolve("value 2");
				t.info("resolving a");
				a.resolve("value 1");
			},
			logs: [
				{text: "resolving b"},
				{text: "resolving a"},
				{text: "callback 1: value 1"},
				{text: "callback 2: value 2"}
			]
		},
		{
			test: function test_def_par_then2_resolve(t){
				var a = new Deferred();
				a.then(function(v){ t.info("callback 1: " + v); });
				a.then(function(v){ t.info("callback 2: " + v); });
				t.info("resolving");
				a.resolve("value");
			},
			logs: [
				{text: "resolving"},
				{text: "callback 1: value"},
				{text: "callback 2: value"}
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
				{text: "resolving"},
				{text: "callback 1: value"},
				{text: "callback 2: value"}
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
				{text: "resolving a"},
				{text: "resolving b"},
				{text: "callback 1: value"},
				{text: "callback 2: value"}
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
				{text: "resolving b"},
				{text: "resolving a"},
				{text: "callback 1: value"},
				{text: "callback 2: value"}
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
				{text: "resolving a"},
				{text: "callback 1: value"},
				{text: "callback 2: value"},
				{text: "callback 3: value"}
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
				{text: "resolving a"},
				{text: "callback 1: value"},
				{text: "callback 2: value 2"},
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
				{text: "cancelling a"},
				{text: "cancelled: stop"},
				{text: "errback: stop"}
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
				{text: "cancelling a"},
				{text: "cancelled: stop"}
			]
		},
		{
			test: function test_def_then_b_then_cancel_a(t) {
				var a = new Deferred( function(v){ t.info("cancelled: " + v); } );
				a.then( function(v){ t.info("callback 1: " + v); },
						function(v){ t.info("errback 1: " + v); } )
				 .done( function(v){ t.info("callback 2: " + v); },
						function(v){ t.info("errback 2: " + v); } );
				t.info("cancelling a");
				a.cancel( "stop" );
			},
			logs: [
				{text: "cancelling a"},
				{text: "cancelled: stop"},
				{text: "errback 1: stop"},
				{text: "errback 2: stop"}
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
				{text: "cancelling b"},
				{text: "cancelled: stop"},
				{text: "errback 1: stop"},
				{text: "errback 2: stop"}
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
				{text: "cancelling b"},
				{text: "errback 2: stop"},
				{text: "resolving a"},
				{text: "callback 1: value"}
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
				{text: "rejecting a"},
				{text: "resolving b"},
				{text: "errback: value"}
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
				{text: "resolving b"},
				{text: "rejecting a"},
				{text: "errback: value"}
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
				{text: "rejecting a"},
				{text: "rejecting b"},
				{text: "errback: value"}
			]
		},
		{
			test: function test_def_reject_to_rejected_sync(t) {
				var a = new Deferred(),
					b = new Deferred();
				a.done( function(v){ t.info("callback: " + v); },
						function(v){ t.info("errback: " + v); return v; } );
				t.info("rejecting b");
				b.reject( "value" );
				t.info("rejecting a");
				a.reject( b );
			},
			logs: [
				{text: "rejecting b"},
				{text: "rejecting a"},
				{text: "errback: value"}
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
				{text: "resolving a"},
				{text: "rejecting b"},
				{text: "errback: value"}
			]
		},
		{
			test: function test_def_resolve_to_rejected_sync(t) {
				var a = new Deferred(),
					b = new Deferred();
				a.done( function(v){ t.info("callback: " + v); },
						function(v){ t.info("errback: " + v); return v; } );
				t.info("rejecting b");
				b.reject( "value" );
				t.info("resolving a");
				a.resolve( b );
			},
			logs: [
				{text: "rejecting b"},
				{text: "resolving a"},
				{text: "errback: value"}
			]
		}
	]);

	return {};
});
