(function(_,f){window.heya.async.whenDone=f(window.heya.async.Deferred,window.heya.async.generic.whenDone);})
(["./Deferred", "./generic/whenDone"], function(Deferred, instrumentWhenDone){
	"use strict";

	return instrumentWhenDone(Deferred);
});
