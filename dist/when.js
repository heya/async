(function(_,f){window.heya.async.when=f(window.heya.async.Deferred,window.heya.async.generic.when);})
(["./Deferred", "./generic/when"], function(Deferred, instrumentWhen){
	"use strict";

	return instrumentWhen(Deferred);
});
