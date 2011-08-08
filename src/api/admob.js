//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.api.admob");

/**
 * @param {Element} element
 */
hydra.api.admob.showAd = function (element) {
    if (element && window["_admob"]) {
        element.textContent = ""; // Clear it out first
        _admob.fetchAd(element);
    }
}

/**
 * @param {string} publisherId
 * @param {Element} element
 */
hydra.api.admob.init = function (publisherId, element) {
    if (navigator.onLine !== false) {
        window["admob_vars"] = {
            "pubid": publisherId,
            "bgcolor": "000000", // background color (hex)
            "text": "FFFFFF", // font-color (hex)
            "ama": false, // set to true and retain comma for the AdMob Adaptive Ad Unit, a special ad type designed for PC sites accessed from the iPhone.  More info: http://developer.admob.com/wiki/IPhone#Web_Integration
            "test": goog.DEBUG, // test mode, set to false to receive live ads
            "manual_mode": true,
            "new_window": true
        };
        var script = document.createElement("script");
        script.src = "http://mmv.admob.com/static/iphone/iadmob.js";
        script.onload = function () {
            hydra.api.admob.showAd(element);
        }
        document.body.appendChild(script);
    }
}
