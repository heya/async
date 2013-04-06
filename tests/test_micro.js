/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../Micro"],
function(module, unit, Micro){
	"use strict";

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
		{
			test: function test_chain_then_resolve_then(t){
				var a = new Micro(),
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
			test: function test_chain_to_resolved(t) {
				var a = new Micro(),
					b = new Micro( "value" );
				a.done( function(v){ t.info("callback: " + v); } );
				t.info("resolving a");
				a.resolve( b );
			},
			logs: [
				{text: "resolving a"},
				{text: "callback: value"}
			]
		}
	]);

	return {};
});
