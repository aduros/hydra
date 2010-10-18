goog.provide("hydra.admob");

/** @define {string} */
hydra.admob.PUBLISHER_ID = "a14c13755c46172";

hydra.admob.showAd = function (element) {
    if (_admob) {
        _admob.fetchAd(element);
    }
}

/**
 * @param {string} publisherId
 * @param {HTMLElement} element
 */
hydra.admob.init = function (publisherId, element) {
    if (navigator.onLine) {
        admob_vars = {
            "pubid": publisherId,
            "bgcolor": "000000", // background color (hex)
            "text": "FFFFFF", // font-color (hex)
            "ama": false, // set to true and retain comma for the AdMob Adaptive Ad Unit, a special ad type designed for PC sites accessed from the iPhone.  More info: http://developer.admob.com/wiki/IPhone#Web_Integration
            "test": goog.DEBUG, // test mode, set to false to receive live ads
            "manual_mode": true
        };
        var script = document.createElement("script");
        script.src = "http://mmv.admob.com/static/iphone/iadmob.js";
        script.onload = function () {
            _admob.fetchAd(element);
        }
        document.body.appendChild(script);
    }
}
