/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../Deferred",
	"../all", "../any", "../par", "../when", "../timeout", "../adapt"],
function(module, unit, Deferred, all, any, par, when, timeout, adapt){
	"use strict";

	unit.add(module, [
		{
			timeout: 500,
			test: function test_timeout_seq(t){
				var x = t.startAsync("async");
				t.info("starting");
				timeout.from(100).then(function(v){
					t.info("callback 1: " + v);
					return timeout.from(v + 100);
				}).done(function(v){
					t.info("callback 2: " + v);
					x.done();
				});
			},
			logs: [
				{text: "starting"},
				{text: "callback 1: 100"},
				{text: "callback 2: 200"}
			]
		},
		{
			timeout: 500,
			test: function test_timeout_all(t){
				var x = t.startAsync("async");
				all(timeout.from(300), timeout.from(100), timeout.from(200)).
					done(function(v){
						eval(t.TEST("t.unify(v, [300, 100, 200])"));
						x.done();
					});
			}
		},
		{
			timeout: 500,
			test: function test_timeout_all_fail(t){
				var x = t.startAsync("async");
				all(timeout.from(300), timeout.from(100), timeout.failOn(200)).
					done(function(v){
							try{
								t.error("Should not be here");
							}finally{
								x.done();
							}
						},
						function(v){
							eval(t.TEST("v === 200"));
							x.done();
						});
			}
		},
		{
			timeout: 500,
			test: function test_timeout_par(t){
				var x = t.startAsync("async");
				par(timeout.failOn(300), timeout.from(100), timeout.failOn(200)).
					done(function(v){
						eval(t.TEST("t.unify(v, [300, 100, 200])"));
						x.done();
					});
			}
		},
		{
			timeout: 500,
			test: function test_timeout_any(t){
				var x = t.startAsync("async");
				any(timeout.from(300), timeout.from(100), timeout.from(200)).
					done(function(v){
						eval(t.TEST("v === 100"));
						x.done();
					});
			}
		},
		{
			test: function test_adapter_resolve(t){
				var x = new Deferred(),
					a = adapt(x);
				a.done(function(v){ t.info("callback: " + v); return v; });
				t.info("resolving x");
				x.resolve("value");
			},
			logs: [
				{text: "resolving x"},
				{text: "callback: value"}
			]
		},
		{
			test: function test_adapter_reject(t){
				var x = new Deferred(),
					a = adapt(x);
				a.done(null, function(v){ t.info("errback: " + v); return v; });
				t.info("rejecting x");
				x.reject("value");
			},
			logs: [
				{text: "rejecting x"},
				{text: "errback: value"}
			]
		},
		function test_promisify(t){
			if(typeof define != "function"){
				// node.js in our case
				var promisify = require("../promisify"),
					x = t.startAsync("file-access"),
					fs = require("fs"),
					deferred = promisify(fs.stat)("Deferred.js");
				deferred.done(
					function(stats){
						//t.info("fs.stat for Deferred.js: " + JSON.stringify(stats));
						x.done();
					},
					function(error){
						try{
							t.error("fs.stat for Deferred.js has failed");
						}finally{
							x.done();
						}
					});
			}
		},
		{
			test: function test_when_value(t) {
				when( "value", function(v){ t.info( "callback 1: " + v ); } )
					.done( function(v){ t.info( "callback 2: " + v ); } );
			},
			logs: [
				{text: "callback 1: value"},
				{text: "callback 2: value"}
			]
		},
		{
			test: function test_when_promise(t) {
				var a = new Deferred();
				when( a, function(v){ t.info( "callback 1: " + v ); } )
					.done( function(v){ t.info( "callback 2: " + v ); } );
				t.info( "resolving a" );
				a.resolve( "value" );
			},
			logs: [
				{text: "resolving a"},
				{text: "callback 1: value"},
				{text: "callback 2: value"}
			]
		},
		{
			test: function test_all_success(t) {
				var a = new Deferred(),
					b = new Deferred();
				all(a,b)
					.done( function(v) { t.info( "callback: " + v.join(',') ); } );
				t.info( "resolving b" );
				b.resolve( "b" );
				t.info( "resolving a" );
				a.resolve( "a" );
			},
			logs: [
				{text: "resolving b"},
				{text: "resolving a"},
				{text: "callback: a,b"}
			]
		},
		{
			test: function test_all_failure1(t) {
				var a = new Deferred( function(v){ t.info( "cancelled a: " + v ); } ),
					b = new Deferred();
				all(a,b)
					.done( function(v) { t.info( "callback: " + v.join(',') ); },
						   function(err) { t.info( "errback: " + err ); return err; } );
				t.info( "rejecting b" );
				b.reject( "b" );
			},
			logs: [
				{text: "rejecting b"},
				{text: "cancelled a: b"},
				{text: "errback: b"}
			]
		},
		{
			test: function test_all_failure2(t) {
				var a = new Deferred(),
					b = new Deferred();
				all(a,b)
					.done( function(v) { t.info( "callback: " + v.join(',') ); },
						   function(err) { t.info( "errback: " + err ); return err; } );
				t.info( "resolving a" );
				a.resolve( "a" );
				t.info( "rejecting b" );
				b.reject( "b" );
			},
			logs: [
				{text: "resolving a"},
				{text: "rejecting b"},
				{text: "errback: b"}
			]
		},
		{
			test: function test_all_cancel(t) {
				var a = new Deferred( function(v){ t.info( "cancelled a: " + v ); } ),
					b = new Deferred( function(v){ t.info( "cancelled b: " + v ); } ),
					c = all(a,b);

				c.done( function(v) { t.info( "callback: " + v.join(',') ); },
						function(err) { t.info( "errback: " + err ); return err; } );

				t.info( "resolving a" );
				a.resolve("a");
				t.info( "cancelling c" );
				c.cancel( "c" );
			},
			logs: [
				{text: "resolving a"},
				{text: "cancelling c"},
				{text: "cancelled b: c"},
				{text: "errback: c"}
			]
		},
		{
			test: function test_all_inclusive(t) {
				var a = new Deferred(),
					b = new Deferred();
				all.inclusive(a,b)
					.done( function(v) { t.info( "callback: " + v.join(',') ); } );
				t.info( "resolving b" );
				b.resolve( "b" );
				t.info( "rejecting a" );
				a.reject( "a" );
			},
			logs: [
				{text: "resolving b"},
				{text: "rejecting a"},
				{text: "callback: a,b"}
			]
		},
		{
			test: function test_any_success(t) {
				var a = new Deferred(),
					b = new Deferred( function(v){ t.info( "cancelling b: " + v ); } );
				any(a,b)
					.done( function(v) { t.info( "callback: " + v ); } );
				t.info( "resolving a" );
				a.resolve( "a" );
			},
			logs: [
				{text: "resolving a"},
				{text: "callback: a"},
				{text: "cancelling b: [Error: not required]"}
			]
		},
		{
			test: function test_any_failure1(t) {
				var a = new Deferred(),
					b = new Deferred();
				any(a,b)
					.done( function(v) { t.info( "callback: " + v ); },
						   function(err) { t.info( "errback: " + err ); return err; } );
				t.info( "rejecting b" );
				b.reject( "b" );
				t.info( "resolving a" );
				a.resolve( "a" );
			},
			logs: [
				{text: "rejecting b"},
				{text: "resolving a"},
				{text: "callback: a"}
			]
		},
		{
			test: function test_any_failure2(t) {
				var a = new Deferred(),
					b = new Deferred();
				any(a,b)
					.done( function(v) { t.info( "callback: " + v ); },
						   function(err) { t.info( "errback: " + err ); return err; } );
				t.info( "rejecting a" );
				a.reject( "a" );
				t.info( "rejecting b" );
				b.reject( "b" );
			},
			logs: [
				{text: "rejecting a"},
				{text: "rejecting b"},
				{text: "errback: b"}
			]
		},
		{
			test: function test_any_cancel(t) {
				var a = new Deferred( function(v){ t.info( "cancelled a: " + v ); } ),
					b = new Deferred( function(v){ t.info( "cancelled b: " + v ); } ),
					c = any(a,b);

				c.done( function(v) { t.info( "callback: " + v ); },
						function(err) { t.info( "errback: " + err ); return err; } );

				t.info( "rejecting a" );
				a.reject("a");
				t.info( "cancelling c" );
				c.cancel( "c" );
			},
			logs: [
				{text: "rejecting a"},
				{text: "cancelling c"},
				{text: "cancelled b: c"},
				{text: "errback: c"}
			]
		},
		{
			test: function test_any_inclusive(t) {
				var a = new Deferred(),
					b = new Deferred(),
					bb = b.then( function(v){ t.info( "callback 1: " + v ); } );
				any.inclusive(a,bb)
					.done( function(v) { t.info( "callback 2: " + v ); } );
				t.info( "resolving a" );
				a.resolve( "a" );
				t.info( "resolving b" );
				b.resolve( "b" );
			},
			logs: [
				{text: "resolving a"},
				{text: "callback 2: a"},
				{text: "resolving b"},
				{text: "callback 1: b"}
			]
		}
	]);

	return {};
});
