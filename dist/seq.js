(function(_,f){window.heya.async.seq=f(window.heya.async.Deferred,window.heya.async.generic.seq);})
(["./Deferred", "./generic/seq"], function(Deferred, instrumentSeq){
	"use strict";

	return instrumentSeq(Deferred);
});
