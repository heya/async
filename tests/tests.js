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
				{meta: {name: "info"}, text: "resolving"},
				{meta: {name: "info"}, text: "callback: value"}
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
				{meta: {name: "info"}, text: "resolving"},
				{meta: {name: "info"}, text: "callback: value"}
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
				{meta: {name: "info"}, text: "resolving"},
				{meta: {name: "info"}, text: "callback 1: value"},
				{meta: {name: "info"}, text: "callback 2: value"}
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
				{meta: {name: "info"}, text: "resolving"},
				{meta: {name: "info"}, text: "callback 1: value"},
				{meta: {name: "info"}, text: "callback 2: value"}
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
				{meta: {name: "info"}, text: "resolving a"},
				{meta: {name: "info"}, text: "resolving b"},
				{meta: {name: "info"}, text: "callback: value"}
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
				{meta: {name: "info"}, text: "resolving a"},
				{meta: {name: "info"}, text: "callback 1: value 1"},
				{meta: {name: "info"}, text: "resolving b"},
				{meta: {name: "info"}, text: "callback 2: value 2"}
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
				{meta: {name: "info"}, text: "resolving b"},
				{meta: {name: "info"}, text: "resolving a"},
				{meta: {name: "info"}, text: "callback 1: value 1"},
				{meta: {name: "info"}, text: "callback 2: value 2"}
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
				{meta: {name: "info"}, text: "resolving"},
				{meta: {name: "info"}, text: "callback 1: value"},
				{meta: {name: "info"}, text: "callback 2: value"}
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
				{meta: {name: "info"}, text: "resolving"},
				{meta: {name: "info"}, text: "callback 1: value"},
				{meta: {name: "info"}, text: "callback 2: value"}
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
				{meta: {name: "info"}, text: "resolving a"},
				{meta: {name: "info"}, text: "resolving b"},
				{meta: {name: "info"}, text: "callback 1: value"},
				{meta: {name: "info"}, text: "callback 2: value"}
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
				{meta: {name: "info"}, text: "resolving b"},
				{meta: {name: "info"}, text: "resolving a"},
				{meta: {name: "info"}, text: "callback 1: value"},
				{meta: {name: "info"}, text: "callback 2: value"}
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
				{meta: {name: "info"}, text: "resolving a"},
				{meta: {name: "info"}, text: "callback 1: value"},
				{meta: {name: "info"}, text: "callback 2: value"},
				{meta: {name: "info"}, text: "callback 3: value"}
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
				{meta: {name: "info"}, text: "progress 1"},
				{meta: {name: "info"}, text: "progback: 1"},
				{meta: {name: "info"}, text: "progress 2"},
				{meta: {name: "info"}, text: "progback: 2"},
				{meta: {name: "info"}, text: "resolving value"},
				{meta: {name: "info"}, text: "callback: value"}
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
				{meta: {name: "info"}, text: "progress 1"},
				{meta: {name: "info"}, text: "progback: 1"},
				{meta: {name: "info"}, text: "progress 2"},
				{meta: {name: "info"}, text: "progback: 2"},
				{meta: {name: "info"}, text: "rejecting value"},
				{meta: {name: "info"}, text: "errback: value"}
			]
		},
		{
			test: function test_def_prog_can(t){
				var a = new Deferred(function(v){ return v + " " + 2; });
				defCallbacks(t, a).then(function(v){ t.info("extracted: " + v.x); });
				t.info("progress 1");
				a.progress(1);
				t.info("progress 2");
				a.progress(2);
				t.info("canceling value");
				a.cancel("value");
			},
			logs: [
				{meta: {name: "info"}, text: "progress 1"},
				{meta: {name: "info"}, text: "progback: 1"},
				{meta: {name: "info"}, text: "progress 2"},
				{meta: {name: "info"}, text: "progback: 2"},
				{meta: {name: "info"}, text: "canceling value"},
				{meta: {name: "info"}, text: "errback: [object Object]"},
				{meta: {name: "info"}, text: "extracted: value 2"}
			]
		}
	]);

	unit.run();
});
