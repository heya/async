/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../Deferred",
	"../all", "../any", "../par", "../one", "../seq", "../when", "../whenDone", "../timeout"],
function(module, unit, Deferred, all, any, par, one, seq, when, whenDone, timeout){
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
				"starting",
				"callback 1: 100",
				"callback 2: 200"
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
			timeout: 500,
			test: function test_timeout_cancel(t){
				var x = t.startAsync("async"),
					a = new Deferred( function(v){ t.info( "cancelled: " + v ); } );

				timeout.cancel( a, 300, "timeout" )
					.then(function(v){ t.info( "callback: " + v ); },
							function(v){ t.info( "errback: " + v ); return v; } )
					.done( x.done.bind(x) );
			},
			logs: [
				"cancelled: timeout",
				"errback: timeout"
			]
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
				"resolving x",
				"callback: value"
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
				"rejecting x",
				"errback: value"
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
				when("value", function(v){ t.info("callback 1: " + v); })
					.done(function(v){ t.info("callback 2: " + v); });
			},
			logs: [
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_when_promise(t) {
				var a = new Deferred();
				when(a, function(v){ t.info("callback 1: " + v); })
					.done(function(v){ t.info("callback 2: " + v); });
				t.info("resolving a");
				a.resolve("value");
			},
			logs: [
				"resolving a",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			test: function test_whenDone_value(t) {
				when("value", function(v){ t.info("callback 1: " + v); });
			},
			logs: [
				"callback 1: value"
			]
		},
		{
			test: function test_whenDone_promise(t) {
				var a = new Deferred();
				when(a, function(v){ t.info("callback 1: " + v); });
				t.info("resolving a");
				a.resolve("value");
			},
			logs: [
				"resolving a",
				"callback 1: value"
			]
		},
		{
			test: function test_all_sync_success(t) {
				all( when("value"), undefined )
					.done( function(v) { t.info( "callback: " + v.join(',') ); } );
			},
			logs: [
				"callback: value,"
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
				"resolving b",
				"resolving a",
				"callback: a,b"
			]
		},
		{
			test: function test_all_failure1(t) {
				var a = new Deferred( function(v){ t.info( "cancelled a: " + v ); } ),
					b = new Deferred();
				all(a,b)
					.done(function(v) { t.info( "callback: " + v.join(',') ); },
							function(err) { t.info( "errback: " + err ); return err; } );
				t.info( "rejecting b" );
				b.reject( "b" );
			},
			logs: [
				"rejecting b",
				"cancelled a: b",
				"errback: b"
			]
		},
		{
			test: function test_all_failure2(t) {
				var a = new Deferred(),
					b = new Deferred();
				all(a,b)
					.done(function(v) { t.info( "callback: " + v.join(',') ); },
							function(err) { t.info( "errback: " + err ); return err; } );
				t.info( "resolving a" );
				a.resolve( "a" );
				t.info( "rejecting b" );
				b.reject( "b" );
			},
			logs: [
				"resolving a",
				"rejecting b",
				"errback: b"
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
				"resolving a",
				"cancelling c",
				"cancelled b: c",
				"errback: c"
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
				"rejecting a",
				"resolving b",
				"callback: a,b"
			]
		},
		{
			test: function test_all_inclusive_failure(t) {
				var a = new Deferred(),
					b = new Deferred();
				par(a,b)
					.done(function(v) { t.info( "callback: " + v.join(',') ); },
							function(v) { t.info( "errback: " + v ); return v; } );
				t.info( "rejecting a" );
				a.reject( "a" );
				t.info( "rejecting b" );
				b.reject( "b" );
			},
			logs: [
				"rejecting a",
				"rejecting b",
				"callback: a,b"
			]
		},
		{
			test: function test_any_sync_success(t) {
				any( when("value"), undefined )
					.done( function(v) { t.info( "callback: " + v ); } );
			},
			logs: [
				"callback: value"
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
				"resolving a",
				"callback: a",
				"cancelling b: [Error: not required]"
			]
		},
		{
			test: function test_any_failure1(t) {
				var a = new Deferred(),
					b = new Deferred();
				any(a,b)
					.done(function(v) { t.info( "callback: " + v ); },
							function(err) { t.info( "errback: " + err ); return err; } );
				t.info( "rejecting b" );
				b.reject( "b" );
				t.info( "resolving a" );
				a.resolve( "a" );
			},
			logs: [
				"rejecting b",
				"resolving a",
				"callback: a"
			]
		},
		{
			test: function test_any_failure2(t) {
				var a = new Deferred(),
					b = new Deferred();
				any(a,b)
					.done(function(v) { t.info( "callback: " + v ); },
							function(err) { t.info( "errback: " + err ); return err; } );
				t.info( "rejecting a" );
				a.reject( "a" );
				t.info( "rejecting b" );
				b.reject( "b" );
			},
			logs: [
				"rejecting a",
				"rejecting b",
				"errback: b"
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
				"rejecting a",
				"cancelling c",
				"cancelled b: c",
				"errback: c"
			]
		},
		{
			test: function test_one_sync_success(t) {
				one( when("value"), undefined )
					.done( function(v) { t.info( "callback: " + v ); } );
			},
			logs: [
				"callback: value"
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
				"resolving a",
				"callback: a",
				"cancelling b: [Error: not required]"
			]
		},
		{
			test: function test_one_failure1(t) {
				var a = new Deferred( function(v){ t.info( "cancelling a: " + v ); } ),
					b = new Deferred();
				one(a,b)
					.done(function(v) { t.info( "callback: " + v ); },
							function(err) { t.info( "errback: " + err ); return err; } );
				t.info( "rejecting b" );
				b.reject( "b" );
			},
			logs: [
				"rejecting b",
				"cancelling a: b",
				"errback: b"
			]
		},
		{
			test: function test_one_failure2(t) {
				var a = new Deferred( function(v){ t.info( "cancelled a: " + v ); } ),
					b = new Deferred( function(v){ t.info( "cancelled b: " + v ); } ),
					c = one(a,b);

				c.done( function(v) { t.info( "callback: " + v ); },
						function(err) { t.info( "errback: " + err ); return err; } );

				t.info( "rejecting a" );
				a.reject("a");
			},
			logs: [
				"rejecting a",
				"cancelled b: a",
				"errback: a"
			]
		},
		{
			test: function test_seq_resolve_ab(t){
				var a = seq(
						function(v){ t.info("callback 1: " + v); return b; },
						function(v){ t.info("callback 2: " + v); }
					),
					b = new Deferred();
				t.info("resolving a");
				a.begin.resolve("value 1");
				t.info("resolving b");
				b.resolve("value 2");
				a.end.done(function(v){ t.info("callback 3: " + v); });
			},
			logs: [
				"resolving a",
				"callback 1: value 1",
				"resolving b",
				"callback 2: value 2",
				"callback 3: value 2"
			]
		},
		{
			test: function test_seq_resolve_ba(t){
				var a = seq(
						function(v){ t.info("callback 1: " + v); return b; },
						function(v){ t.info("callback 2: " + v); }
					),
					b = new Deferred();
				a.end.done(function(v){ t.info("callback 3: " + v); });
				t.info("resolving b");
				b.resolve("value 2");
				t.info("resolving a");
				a.begin.resolve("value 1");
			},
			logs: [
				"resolving b",
				"resolving a",
				"callback 1: value 1",
				"callback 2: value 2",
				"callback 3: value 2"
			]
		}
	]);

	return {};
});
