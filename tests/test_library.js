/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../Deferred",
	"../all", "../any", "../par", "../one", "../when", "../timeout"],
function(module, unit, Deferred, all, any, par, one, when, timeout){
	"use strict";

	unit.add(module, [
		{
			timeout: 500,
			test: function test_timeout_seq(t){
				var x = t.startAsync("async");
				t.info("starting");
				timeout.resolve(100).then(function(v){
					t.info("callback 1: " + v);
					return timeout.resolve(v + 100);
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
				all(timeout.resolve(300), timeout.resolve(100), timeout.resolve(200)).
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
				all(timeout.resolve(300), timeout.resolve(100), timeout.reject(200)).
					done(function(v){
							try{
								t.error("Should not be here");
							}finally{
								x.done();
							}
						},
						function(v){
							eval(t.TEST("v.timeout === 200"));
							x.done();
							return false;
						});
			}
		},
		{
			timeout: 500,
			test: function test_timeout_par(t){
				var x = t.startAsync("async");
				par(timeout.reject(300), timeout.resolve(100), timeout.reject(200)).
					done(function(v){
						eval(t.TEST("t.unify(v, [ { timeout: 300 }, 100, { timeout: 200 } ])"));
						x.done();
					});
			}
		},
		{
			timeout: 500,
			test: function test_timeout_any(t){
				var x = t.startAsync("async");
				any(timeout.resolve(300), timeout.resolve(100), timeout.resolve(200)).
					done(function(v){
						eval(t.TEST("v === 100"));
						x.done();
					});
			}
		},
		{
			test: function test_adapter_resolve(t){
				var x = new Deferred(),
					a = when(x);
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
					a = when(x);
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
						return false;
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
			test: function test_all_sync_success(t) {
				all( when("value"), undefined )
					.done( function(v) { t.info( "callback: " + v.join(',') ); } );
			},
			logs: [
				{text: "callback: value,"}
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
				par(a,b)
					.done( function(v) { t.info( "callback: " + v.join(',') ); } );
				t.info( "rejecting a" );
				a.reject( "a" );
				t.info( "resolving b" );
				b.resolve( "b" );
			},
			logs: [
				{text: "rejecting a"},
				{text: "resolving b"},
				{text: "callback: a,b"}
			]
		},
		{
			test: function test_all_inclusive_failure(t) {
				var a = new Deferred(),
					b = new Deferred();
				par(a,b)
					.done( function(v) { t.info( "callback: " + v.join(',') ); },
						   function(v) { t.info( "errback: " + v ); return v; } );
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
			test: function test_any_sync_success(t) {
				any( when("value"), undefined )
					.done( function(v) { t.info( "callback: " + v ); } );
			},
			logs: [
				{text: "callback: value"}
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
			test: function test_one_sync_success(t) {
				one( when("value"), undefined )
					.done( function(v) { t.info( "callback: " + v ); } );
			},
			logs: [
				{text: "callback: value"}
			]
		},
		{
			test: function test_one_success(t) {
				var a = new Deferred(),
					b = new Deferred( function(v){ t.info( "cancelling b: " + v ); } );
				one(a,b)
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
			test: function test_one_failure1(t) {
				var a = new Deferred( function(v){ t.info( "cancelling a: " + v ); } ),
					b = new Deferred();
				one(a,b)
					.done( function(v) { t.info( "callback: " + v ); },
						   function(err) { t.info( "errback: " + err ); return err; } );
				t.info( "rejecting b" );
				b.reject( "b" );
			},
			logs: [
				{text: "rejecting b"},
				{text: "cancelling a: [Error: not required]"},
				{text: "errback: b"}
			]
		},
		{
			test: function test_one_cancel(t) {
				var a = new Deferred( function(v){ t.info( "cancelled a: " + v ); } ),
					b = new Deferred( function(v){ t.info( "cancelled b: " + v ); } ),
					c = one(a,b);

				c.done( function(v) { t.info( "callback: " + v ); },
						function(err) { t.info( "errback: " + err ); return err; } );

				t.info( "rejecting a" );
				a.reject("a");
			},
			logs: [
				{text: "rejecting a"},
				{text: "cancelled b: [Error: not required]"},
				{text: "errback: a"}
			]
		}
	]);

	return {};
});
