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
				"resolving",
				"callback: value"
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
				"resolving",
				"callback: value"
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
				"resolving",
				"callback 1: value",
				"callback 2: value"
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
				"resolving",
				"callback 1: value",
				"callback 2: value"
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
				"resolving a",
				"resolving b",
				"callback: value"
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
				"resolving a",
				"callback 1: value 1",
				"resolving b",
				"callback 2: value 2"
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
				"resolving b",
				"resolving a",
				"callback 1: value 1",
				"callback 2: value 2"
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
				"resolving",
				"callback 1: value",
				"callback 2: value"
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
				"resolving",
				"callback 1: value",
				"callback 2: value"
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
				"resolving a",
				"resolving b",
				"callback 1: value",
				"callback 2: value"
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
				"resolving b",
				"resolving a",
				"callback 1: value",
				"callback 2: value"
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
				"resolving a",
				"callback 1: value",
				"callback 2: value",
				"callback 3: value"
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
				"resolving a",
				"callback 1: value",
				"callback 2: value 2"
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
				"resolving a",
				"callback: value"
			]
		},
		{
			test: function test_resolve_a_then2_resolve_b(t){
				var a = new Micro(), b = new Micro();
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
			test: function test_resolve_ab_then2(t){
				var a = new Micro(), b = new Micro();
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
			test: function test_double_resolve(t){
				var a = new Micro();
				a.then(function(v){ t.info("value: " + v); });
				t.info("resolving with 1");
				a.resolve(1);
				t.info("resolving with 2");
				try{
					a.resolve(2);
					t.info("shouldn't be here");
				}catch(e){
					t.info("error");
				}
			},
			logs: [
				"resolving with 1",
				"value: 1",
				"resolving with 2",
				"error"
			]
		}
	]);

	return {};
});
