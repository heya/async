(function(factory){
	var deps = ["module", "heya-unit", "../Micro", "../main"];
	if(typeof define != "undefined"){ // AMD
		define(deps, factory);
	}else if(typeof module != "undefined"){ // node.js
		factory.apply(null,
			deps.filter(function(_, i){ return i < factory.length; }).
			map(function req(name){
				return name === "require" && require || name === "module" && module || require(name);
			}));
	}
})(function(module, unit, Micro, Deferred){
	"use strict";

	function defCallbacks(t, d, verb){
		return d[verb || "then"](
				function(v){ t.info("callback: " + v); return v; },
				function(v){ t.info("errback: " + v); return v; },
				function(v){ t.info("progback: " + v); return v; }
			);
	}

	unit.add(module, [
		// micro tests
		{
			test: function test_then_resolve(t){
				var a = new Micro();
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
			test: function test_resolve_then(t){
				var a = new Micro();
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
			test: function test_then2_resolve(t){
				var a = new Micro();
				a.then(function(v){ t.info("callback 1: " + v); return v; }).
					then(function(v){ t.info("callback 2: " + v); });
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
			test: function test_resolve_then2(t){
				var a = new Micro();
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
			test: function test_then_resolve_ab(t){
				var a = new Micro(), b = new Micro();
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
			test: function test_then2_resolve_ab(t){
				var a = new Micro(), b = new Micro();
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
			test: function test_then2_resolve_ba(t){
				var a = new Micro(), b = new Micro();
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
			test: function test_par_then2_resolve(t){
				var a = new Micro();
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
			test: function test_par_resolve_then2(t){
				var a = new Micro();
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
			test: function test_par_then_resolve_ab(t){
				var a = new Micro(), b = new Micro();
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
			test: function test_par_then_resolve_ba(t){
				var a = new Micro(), b = new Micro();
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
			test: function test_chain_abc(t){
				var a = new Micro();
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
			test: function test_def_prog_can(t){
				var a = new Deferred(function(v){ return v + " " + 2; });
				defCallbacks(t, a).then(function(v){ t.info("extracted: " + v); });
				t.info("progress 1");
				a.progress(1);
				t.info("progress 2");
				a.progress(2);
				t.info("canceling value");
				a.cancel("value");
			},
			logs: [
				{text: "progress 1"},
				{text: "progback: 1"},
				{text: "progress 2"},
				{text: "progback: 2"},
				{text: "canceling value"},
				{text: "errback: value 2"},
				{text: "extracted: value 2"}
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
				a.then(function(v){ t.info("callback 1: " + v); return v; }).
					then(function(v){ t.info("callback 2: " + v); });
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
		}
	]);

	unit.run();
});
