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
				a.done(null, function(v){ t.info("errback: " + v); throw v; });
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
		}
	]);

	return {};
});
