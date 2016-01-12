/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../FastDeferred"],
 function(module, unit, FastDeferred){
	"use strict";

	function defCallbacks(t, d, verb){
		return d.promise[verb || "then"](
			function(v){ t.info("callback: " + v); return v; },
			function(v){ t.info("errback: " + v); return FastDeferred.reject(v); },
			function(v){ t.info("progback: " + v); }
		);
	}

	unit.add(module, [
		// main tests
		{
			test: function test_def_prog_res(t){
				var a = new FastDeferred();
				defCallbacks(t, a);
				t.info("progress 1");
				a.progress(1);
				t.info("progress 2");
				a.progress(2);
				t.info("resolving value");
				a.resolve("value");
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
				var a = new FastDeferred();
				defCallbacks(t, a);
				t.info("progress 1");
				a.progress(1);
				t.info("progress 2");
				a.progress(2);
				t.info("rejecting value");
				a.reject("value");
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
				var a = new FastDeferred();
				a.promise.then(
					function(v){ t.info("callback 1: " + v); return v; },
					function(v){ t.info("errback 1: " + v); return FastDeferred.reject(v); }
				).done(
					function(v){ t.info("callback 2: " + v); },
					function(v){ t.info("errback 2: " + v); }
				);
				t.info("rejecting error");
				a.reject("error");
			},
			logs: [
				"rejecting error",
				"errback 1: error",
				"errback 2: error"
			]
		},
		{
			test: function test_def_rej_pass_uncaught(t){
				var a = new FastDeferred();
				a.promise.then(
					function(v){ t.info("callback 1: " + v); return v; }
				).done(
					function(v){ t.info("callback 2: " + v); }
				);
				t.info("rejecting error");
				a.reject("error");
			},
			logs: [
				"rejecting error",
				{text: "error", meta: {name: "error"}}
			]
		},
		{
			test: function test_def_rej_res(t){
				var a = new FastDeferred();
				a.promise.then(
					function(v){ t.info("callback 1: " + v); return v; },
					function(v){ t.info("errback 1: " + v); return "value"; }
				).done(
					function(v){ t.info("callback 2: " + v); },
					function(v){ t.info("errback 2: " + v); }
				);
				t.info("rejecting error");
				a.reject("error");
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
				var a = new FastDeferred();
				a.promise.then(function(v){ t.info("callback: " + v); });
				t.info("resolving");
				a.resolve("value");
			},
			logs: [
				"resolving",
				"callback: value"
			]
		},
		{
			test: function test_def_resolve_then(t){
				var a = new FastDeferred();
				t.info("resolving");
				a.resolve("value");
				a.promise.then(function(v){ t.info("callback: " + v); });
			},
			logs: [
				"resolving",
				"callback: value"
			]
		},
		{
			test: function test_def_then2_resolve(t){
				var a = new FastDeferred();
				a.promise.
					then(function(v){ t.info("callback 1: " + v); return v; }).
					then(function(v){ t.info("callback 2: " + v); return v; });
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
			test: function test_def_then_pass(t){
				var a = new FastDeferred();
				a.promise.
					then(function(v){ t.info("callback 1: " + v); return v; }).
					done(function(v){ t.info("callback 2: " + v); });
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
			test: function test_def_resolve_then2(t){
				var a = new FastDeferred();
				t.info("resolving");
				a.resolve("value");
				a.promise.
					then(function(v){ t.info("callback 1: " + v); return v; }).
					then(function(v){ t.info("callback 2: " + v); return v; });
			},
			logs: [
				"resolving",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_def_then_resolve_ab(t){
				var a = new FastDeferred(), b = new FastDeferred();
				a.promise.then(function(v){ t.info("callback: " + v); return v; });
				t.info("resolving a");
				a.resolve(b.promise);
				t.info("resolving b");
				b.resolve("value");
			},
			logs: [
				"resolving a",
				"resolving b",
				"callback: value"
			]
		},
		{
			test: function test_def_then2_resolve_ab(t){
				var a = new FastDeferred(), b = new FastDeferred();
				a.promise.
					then(function(v){ t.info("callback 1: " + v); return b.promise; }).
					then(function(v){ t.info("callback 2: " + v); return v; });
				t.info("resolving a");
				a.resolve("value 1");
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
			test: function test_def_then2_resolve_ba(t){
				var a = new FastDeferred(), b = new FastDeferred();
				a.promise.
					then(function(v){ t.info("callback 1: " + v); return b.promise; }).
					then(function(v){ t.info("callback 2: " + v); return v; });
				t.info("resolving b");
				b.resolve("value 2");
				t.info("resolving a");
				a.resolve("value 1");
			},
			logs: [
				"resolving b",
				"resolving a",
				"callback 1: value 1",
				"callback 2: value 2"
			]
		},
		{
			test: function test_def_par_then2_resolve(t){
				var a = new FastDeferred();
				a.promise.then(function(v){ t.info("callback 1: " + v); return v; });
				a.promise.then(function(v){ t.info("callback 2: " + v); return v; });
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
				var a = new FastDeferred();
				t.info("resolving");
				a.resolve("value");
				a.promise.then(function(v){ t.info("callback 1: " + v); return v; });
				a.promise.then(function(v){ t.info("callback 2: " + v); return v; });
			},
			logs: [
				"resolving",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_def_par_then_resolve_ab(t){
				var a = new FastDeferred(), b = new FastDeferred();
				a.promise.done(function(v){ t.info("callback 1: " + v); });
				a.promise.done(function(v){ t.info("callback 2: " + v); });
				t.info("resolving a");
				a.resolve(b.promise);
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
				var a = new FastDeferred(), b = new FastDeferred();
				a.promise.then(function(v){ t.info("callback 1: " + v); return v; });
				a.promise.then(function(v){ t.info("callback 2: " + v); return v; });
				t.info("resolving b");
				b.resolve("value");
				t.info("resolving a");
				a.resolve(b.promise);
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
				var a = new FastDeferred();
				a.promise.
					then(function(v){ t.info("callback 1: " + v); return v; }).
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
				var a = new FastDeferred(),
					b = a.promise.then(function(v){ t.info("callback 1: " + v); return v + " 2"; });
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
				var a = new FastDeferred(), b = new FastDeferred();
				t.info("resolving a");
				a.resolve("value 1");
				a.promise.
					then(function(v){ t.info("callback 1: " + v); return b.promise; }).
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
				var a = new FastDeferred(), b = new FastDeferred();
				t.info("resolving a");
				a.resolve("value 1");
				t.info("resolving b");
				b.resolve("value 2");
				a.promise.
					then(function(v){ t.info("callback 1: " + v); return b.promise; }).
					then(function(v){ t.info("callback 2: " + v); return v; });
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
				var a = new FastDeferred(function(v){ t.info("cancelled: " + v); });
				a.promise.done(
					function(v){ t.info("callback: " + v); },
					function(v){ t.info("errback: " + v); }
				);
				t.info("cancelling a");
				a.promise.cancel("stop");
			},
			logs: [
				"cancelling a",
				"cancelled: stop",
				"errback: stop"
			]
		},
		{
			test: function test_def_then_cancel_no_errback(t) {
				var a = new FastDeferred(function(v){ t.info("cancelled: " + v); });
				a.promise.done(function(v){ t.info("callback: " + v); });
				t.info("cancelling a");
				a.promise.cancel("stop");
			},
			logs: [
				"cancelling a",
				"cancelled: stop"
			]
		},
		{
			test: function test_def_then_b_then_cancel_a(t) {
				var a = new FastDeferred(function(v){ t.info("cancelled: " + v); });
				a.promise.then(
					function(v){ t.info("callback 1: " + v); return v; },
					function(v){ t.info("errback 1: " + v); return FastDeferred.reject(v); }
				).done(
					function(v){ t.info("callback 2: " + v); },
					function(v){ t.info("errback 2: " + v); }
				);
				t.info("cancelling a");
				a.promise.cancel("stop");
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
				var a = new FastDeferred(function(v){ t.info("cancelled: " + v); }),
					b = a.promise.then(
						function(v){ t.info("callback 1: " + v); return v; },
						function(v){ t.info("errback 1: " + v); return FastDeferred.reject(v); }
					);
				b.done(
					function(v){ t.info("callback 2: " + v); },
					function(v){ t.info("errback 2: " + v); }
				);
				t.info("cancelling b");
				b.cancel("stop");
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
				var a = new FastDeferred(function(v){ t.info("cancelled: " + v); }),
					b = a.promise.then(
						function(v){ t.info("callback 1: " + v); },
						function(v){ t.info("errback 1: " + v); }
					).protect();
				b.done(
					function(v){ t.info("callback 2: " + v); },
					function(v){ t.info("errback 2: " + v); }
				);
				t.info("cancelling b");
				b.cancel("stop");
				t.info("resolving a");
				a.resolve("value");
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
				var a = new FastDeferred(function(v){ t.info("cancelled: " + v); });
				a.promise.protect().done(
					function(v){ t.info("callback 1: " + v); },
					function(v){ t.info("errback 1: " + v); return v; }
				);
				t.info("rejecting a");
				a.reject("error");
			},
			logs: [
				"rejecting a",
				"errback 1: error"
			]
		},
		{
			test: function test_def_then_def_cancel(t) {
				var a = new FastDeferred(function(v){ t.info("cancelled a: " + v); }),
					b = new FastDeferred(function(v){ t.info("cancelled b: " + v); }),
					c = a.promise.then(b);

				b.promise.done(
					function(v){ t.info("callback 1: " + v); },
					function(v){ t.info("errback 1: " + v); }
				);
				c.done(
					function(v){ t.info("callback 2: " + v); },
					function(v){ t.info("errback 2: " + v); return v; }
				);

				t.info("cancelling c");
				c.cancel("stop");
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
				var a = new FastDeferred(),
					b = new FastDeferred();
				a.promise.done(
					function(v){ t.info("callback: " + v); },
					function(v){ t.info("errback: " + v); return v; }
				);
				t.info("rejecting a");
				a.reject(b.promise);
				t.info("resolving b");
				b.resolve("value");
			},
			logs: [
				"rejecting a",
				"resolving b",
				"errback: value"
			]
		},
		{
			test: function test_def_reject_to_resolved_sync(t) {
				var a = new FastDeferred(),
					b = new FastDeferred();
				a.promise.done(
					function(v){ t.info("callback: " + v); },
					function(v){ t.info("errback: " + v); return v; }
				);
				t.info("resolving b");
				b.resolve("value");
				t.info("rejecting a");
				a.reject(b);
			},
			logs: [
				"resolving b",
				"rejecting a",
				"errback: value"
			]
		},
		{
			test: function test_def_reject_to_rejected(t) {
				var a = new FastDeferred(),
					b = new FastDeferred();
				a.promise.done(
					function(v){ t.info("callback: " + v); },
					function(v){ t.info("errback: " + v); return v; }
				);
				t.info("rejecting a");
				a.reject(b);
				t.info("rejecting b");
				b.reject("value");
			},
			logs: [
				"rejecting a",
				"rejecting b",
				"errback: value"
			]
		},
		{
			test: function test_def_reject_to_rejected_sync(t) {
				var a = new FastDeferred(),
					b = new FastDeferred();
				a.promise.done(
					function(v){ t.info("callback: " + v); },
					function(v){ t.info("errback: " + v); }
				);
				t.info("rejecting b");
				b.reject("value", true);
				t.info("rejecting a");
				a.reject(b);
			},
			logs: [
				"rejecting b",
				"rejecting a",
				"errback: value"
			]
		},
		{
			test: function test_def_resolve_to_rejected(t) {
				var a = new FastDeferred(),
					b = new FastDeferred();
				a.promise.done(
					function(v){ t.info("callback: " + v); },
					function(v){ t.info("errback: " + v); }
				);
				t.info("resolving a");
				a.resolve(b);
				t.info("rejecting b");
				b.reject("value");
			},
			logs: [
				"resolving a",
				"rejecting b",
				"errback: value"
			]
		},
		{
			test: function test_def_resolve_to_rejected_sync(t) {
				var a = new FastDeferred(),
					b = new FastDeferred();
				a.promise.done(
					function(v){ t.info("callback: " + v); },
					function(v){ t.info("errback: " + v); }
				);
				t.info("rejecting b");
				b.reject("value", true);
				t.info("resolving a");
				a.resolve(b);
			},
			logs: [
				"rejecting b",
				"resolving a",
				"errback: value"
			]
		}
	]);

	return {};
});
