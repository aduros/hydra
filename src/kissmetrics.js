//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.kissmetrics");

/**
 * @param {string} apiKey
 */
hydra.kissmetrics.init = function (apiKey) {
    if (navigator.onLine !== false) {
        window["_kmq"] = [];
        var _kmq = _kmq || [];
        var load = function (src) {
            var script = document.createElement("script");
            script.src = src;
            script.async = true;
            document.body.appendChild(script);
        }
        load("http://i.kissmetrics.com/i.js");
        load("http://doug1izaerwt3.cloudfront.net/" + apiKey + ".1.js");
    }
}
