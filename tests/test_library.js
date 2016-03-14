/* UMD.define */ (typeof define=="function"&&define||function(d,f,m){m={module:module,require:require};module.exports=f.apply(null,d.map(function(n){return m[n]||require(n)}))})
(["module", "heya-unit", "../index", "../when", "../whilst", "../generic/seq", "../timeout"],
function(module, unit, std, when, whilst, genericSeq, genericTimeout){
	"use strict";

	if(typeof Promise == "undefined"){ return; }

	var all = std.all,
		par = std.par,
		any = std.any,
		one = std.one, // race()
		seq = genericSeq(),
		timeout = genericTimeout();

	unit.add(module, [
		{
			timeout: 500,
			test: function test_timeout_seq(t){
				var x = t.startAsync("async");
				t.info("starting");
				timeout.resolve(100).then(function(v){
					t.info("callback 1: " + v);
					return timeout.resolve(v + 100);
				}).then(function(v){
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
				std.all(timeout.resolve(300), timeout.resolve(100), timeout.resolve(200)).
					then(function(v){
						eval(t.TEST("t.unify(v, [300, 100, 200])"));
						x.done();
					});
			}
		},
		{
			timeout: 500,
			test: function test_timeout_all_fail(t){
				var x = t.startAsync("async");
				std.all(timeout.resolve(300), timeout.resolve(100), timeout.reject(200)).
					then(function(){
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
				std.par(timeout.reject(300), timeout.resolve(100), timeout.reject(200)).
					then(function(v){
						eval(t.TEST("t.unify(v, [ { timeout: 300 }, 100, { timeout: 200 } ])"));
						x.done();
					});
			}
		},
		{
			timeout: 500,
			test: function test_timeout_any(t){
				var x = t.startAsync("async");
				std.any(timeout.resolve(300), timeout.resolve(100), timeout.resolve(200)).
					then(function(v){
						eval(t.TEST("v === 100"));
						x.done();
					});
			}
		},
		{
			timeout: 500,
			test: function test_adapter_resolve(t){
				var x = t.startAsync("async"), resolve,
					p = new Promise(function (res) {
						resolve = res;
					});
				when(p).then(function(v){ t.info("callback: " + v); x.done(); });
				t.info("resolving x");
				resolve("value");
			},
			logs: [
				"resolving x",
				"callback: value"
			]
		},
		{
			timeout: 500,
			test: function test_adapter_reject(t){
				var x = t.startAsync("async"), reject,
					p = new Promise(function (_, rej) {
						reject = rej;
					});
				when(p).then(null, function(v){ t.info("errback: " + v); x.done(); });
				t.info("rejecting x");
				reject("value");
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
				deferred.then(
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
			timeout: 500,
			test: function test_when_value(t) {
				var x = t.startAsync("async");
				when("value").
					then(function(v){ t.info("callback 1: " + v); return v; }).
					then(function(v){ t.info("callback 2: " + v); x.done(); });
			},
			logs: [
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			timeout: 500,
			test: function test_when_promise(t) {
				var x = t.startAsync("async"), resolve,
					a = new Promise(function(res){
						resolve = res;
					});
				when(a).
					then(function(v){ t.info("callback 1: " + v); return v; }).
					then(function(v){ t.info("callback 2: " + v); x.done(); });
				t.info("resolving a");
				resolve("value");
			},
			logs: [
				"resolving a",
				"callback 1: value",
				"callback 2: value"
			]
		},
		{
			timeout: 500,
			test: function test_all_sync_success(t) {
				var x = t.startAsync("async");
				std.all(when("value"), undefined).
					then(function(v) { t.info( "callback: " + v.join(',') ); x.done(); });
			},
			logs: [
				"callback: value,"
			]
		},
		{
			timeout: 500,
			test: function test_all_success(t) {
				var x = t.startAsync("async"),
					resolveA, resolveB,
					a = new Promise(function(res){ resolveA = res; }),
					b = new Promise(function(res){ resolveB = res; });
				std.all(a, b).
					then(function(v) { t.info( "callback: " + v.join(',') ); x.done(); });
				t.info("resolving b");
				resolveB("b");
				t.info("resolving a");
				resolveA("a");
			},
			logs: [
				"resolving b",
				"resolving a",
				"callback: a,b"
			]
		},
		{
			timeout: 500,
			test: function test_all_failure1(t) {
				var x = t.startAsync("async"), rejectB,
					a = new Promise(function(){}),
					b = new Promise(function(_, rej){ rejectB = rej; });
				all(a, b).
					then(function(v){ t.info("callback: " + v.join(',')); },
						function(err){ t.info("errback: " + err); }).
					then(function(){ x.done(); });
				t.info("rejecting b");
				rejectB("b");
			},
			logs: [
				"rejecting b",
				"errback: b"
			]
		},
		{
			timeout: 500,
			test: function test_all_failure2(t) {
				var x = t.startAsync("async"),
					resolveA, rejectB,
					a = new Promise(function(res){ resolveA = res; }),
					b = new Promise(function(_, rej){ rejectB = rej; });
				all(a, b).
					then(function(v) { t.info( "callback: " + v.join(',') ); },
						function(err) { t.info( "errback: " + err ); } ).
					then(function(){ x.done(); });
				t.info("resolving a");
				resolveA( "a" );
				t.info("rejecting b");
				rejectB( "b" );
			},
			logs: [
				"resolving a",
				"rejecting b",
				"errback: b"
			]
		},
		{
			timeout: 500,
			test: function test_all_inclusive(t) {
				var x = t.startAsync("async"),
					rejectA, resolveB,
					a = new Promise(function(_, rej){ rejectA = rej; }),
					b = new Promise(function(res){ resolveB = res; });
				par(a, b).
					then(function(v) { t.info( "callback: " + v.join(',') ); }).
					then(function(){ x.done(); });
				t.info("rejecting a");
				rejectA("a");
				t.info("resolving b");
				resolveB("b");
			},
			logs: [
				"rejecting a",
				"resolving b",
				"callback: a,b"
			]
		},
		{
			timeout: 500,
			test: function test_all_inclusive_failure(t) {
				var x = t.startAsync("async"),
					rejectA, rejectB,
					a = new Promise(function(_, rej){ rejectA = rej; }),
					b = new Promise(function(_, rej){ rejectB = rej; });
				par(a, b).
					then(function(v) { t.info( "callback: " + v.join(',') ); },
						function(v) { t.info( "errback: " + v ); return v; }).
					then(function(){ x.done(); });
				t.info( "rejecting a" );
				rejectA( "a" );
				t.info( "rejecting b" );
				rejectB( "b" );
			},
			logs: [
				"rejecting a",
				"rejecting b",
				"callback: a,b"
			]
		},
		{
			timeout: 500,
			test: function test_any_sync_success(t) {
				var x = t.startAsync("async");
				any(when("value"), undefined).
					then(function(v) { t.info( "callback: " + v ); }).
					then(function(){ x.done(); });
			},
			logs: [
				"callback: value"
			]
		},
		{
			timeout: 500,
			test: function test_any_success(t) {
				var x = t.startAsync("async"),
					resolveA,
					a = new Promise(function(res){ resolveA = res; }),
					b = new Promise(function(){});
				any(a, b).
					then(function(v) { t.info( "callback: " + v ); }).
					then(function(){ x.done(); });
				t.info("resolving a");
				resolveA("a");
			},
			logs: [
				"resolving a",
				"callback: a"
			]
		},
		{
			timeout: 500,
			test: function test_any_failure1(t) {
				var x = t.startAsync("async"),
					resolveA, rejectB,
					a = new Promise(function(res){ resolveA = res; }),
					b = new Promise(function(_, rej){ rejectB = rej; });
				any(a, b).
					then(function(v) { t.info( "callback: " + v ); },
						function(err) { t.info( "errback: " + err ); return err; }).
					then(function(){ x.done(); });
				t.info("rejecting b");
				rejectB("b");
				t.info("resolving a");
				resolveA("a");
			},
			logs: [
				"rejecting b",
				"resolving a",
				"callback: a"
			]
		},
		{
			timeout: 500,
			test: function test_any_failure2(t) {
				var x = t.startAsync("async"),
					rejectA, rejectB,
					a = new Promise(function(_, rej){ rejectA = rej; }),
					b = new Promise(function(_, rej){ rejectB = rej; });
				any(a, b).
					then(function(v) { t.info( "callback: " + v ); },
						function(err) { t.info( "errback: " + err ); return err; }).
					then(function(){ x.done(); });
				t.info("rejecting a");
				rejectA("a");
				t.info("rejecting b");
				rejectB("b");
			},
			logs: [
				"rejecting a",
				"rejecting b",
				"errback: b"
			]
		},
		{
			timeout: 500,
			test: function test_one_sync_success(t) {
				var x = t.startAsync("async");
				one(when("value"), undefined).
					then(function(v) { t.info( "callback: " + v ); }).
					then(function(){ x.done(); });
			},
			logs: [
				"callback: value"
			]
		},
		{
			timeout: 500,
			test: function test_one_success(t) {
				var x = t.startAsync("async"),
					resolveA,
					a = new Promise(function(res){ resolveA = res; }),
					b = new Promise(function(){});
				one(a, b).
					then( function(v) { t.info( "callback: " + v ); } ).
					then(function(){ x.done(); });
				t.info("resolving a");
				resolveA("a");
			},
			logs: [
				"resolving a",
				"callback: a"
			]
		},
		{
			timeout: 500,
			test: function test_one_failure1(t) {
				var x = t.startAsync("async"),
					rejectB,
					a = new Promise(function(){}),
					b = new Promise(function(_, rej){ rejectB = rej; });
				one(a, b).
					then(function(v) { t.info( "callback: " + v ); },
						function(err) { t.info( "errback: " + err ); return err; }).
					then(function(){ x.done(); });
				t.info("rejecting b");
				rejectB("b");
			},
			logs: [
				"rejecting b",
				"errback: b"
			]
		},
		{
			timeout: 500,
			test: function test_one_failure2(t) {
				var x = t.startAsync("async"),
					rejectA,
					a = new Promise(function(_, rej){ rejectA = rej; }),
					b = new Promise(function(){}),
					c = one(a, b);

				c.then(function(v) { t.info( "callback: " + v ); },
					function(err) { t.info( "errback: " + err ); return err; }).
					then(function(){ x.done(); });

				t.info("rejecting a");
				rejectA("a");
			},
			logs: [
				"rejecting a",
				"errback: a"
			]
		},
		{
			timeout: 500,
			test: function test_seq_resolve_ab(t){
				var x = t.startAsync("async"),
					a = seq(
						function(v){ t.info("callback 1: " + v); return b; },
						function(v){ t.info("callback 2: " + v); return v; }
					),
					resolveB,
					b = new Promise(function(res){ resolveB = res; });
				t.info("resolving a");
				a.resolve("value 1");
				t.info("resolving b");
				resolveB("value 2");
				a.end.then(function(v){ t.info("callback 3: " + v); x.done(); });
			},
			logs: [
				"resolving a",
				"resolving b",
				"callback 1: value 1",
				"callback 2: value 2",
				"callback 3: value 2"
			]
		},
		{
			timeout: 500,
			test: function test_seq_resolve_ba(t){
				var x = t.startAsync("async"),
					a = seq(
						function(v){ t.info("callback 1: " + v); return b; },
						function(v){ t.info("callback 2: " + v); return v; }
					),
					resolveB,
					b = new Promise(function(res){ resolveB = res; });
				a.end.then(function(v){ t.info("callback 3: " + v); x.done(); });
				t.info("resolving b");
				resolveB("value 2");
				t.info("resolving a");
				a.resolve("value 1");
			},
			logs: [
				"resolving b",
				"resolving a",
				"callback 1: value 1",
				"callback 2: value 2",
				"callback 3: value 2"
			]
		},
		{
			timeout: 500,
			test: function test_whilst(t){
				var x = t.startAsync("async");
				whilst(
					function(i){ return Promise.resolve(i < 5); },
					function(i){
						t.info("body: " + i);
						return Promise.resolve(i + 1);
					}
				)(0).then(function(i){
					t.info("finish: " + i);
					x.done();
				});
			},
			logs: [
				"body: 0",
				"body: 1",
				"body: 2",
				"body: 3",
				"body: 4",
				"finish: 5"
			]
		},
		{
			timeout: 500,
			test: function test_whilst_no_body(t){
				var x = t.startAsync("async"), i = 0;
				whilst(
					function(){
						t.info("pred: " + i);
						++i;
						return Promise.resolve(i < 5);
					}
				)(0).then(function(){
					t.info("finish");
					x.done();
				});
			},
			logs: [
				"pred: 0",
				"pred: 1",
				"pred: 2",
				"pred: 3",
				"pred: 4",
				"finish"
			]
		}
	]);

	return {};
});
