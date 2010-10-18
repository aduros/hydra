goog.provide("hydra.analytics");

hydra.analytics.init = function (account) {
    if (navigator.onLine) {
        window["_gaq"] = [
            ["_setAccount", account],
            ["_setCustomVar", 1, "Standalone", String(navigator["standalone"]), 2],
            ["_trackPageview"]
        ];
        var script = document.createElement("script");
        script.src = "http://www.google-analytics.com/ga.js";
        // TODO: Clear _gaq if error during loading
        document.body.appendChild(script);
    }
}

hydra.analytics.trackEvent = function (category, action, count) {
    if (goog.DEBUG) {
        console.log("Tracking event", "category", category, "action", action, "count", count);
    }
    if ("_gaq" in window) {
        _gaq.push(["_trackEvent", category, action, undefined, count]);
    }
}

hydra.analytics.trackState = function (stateName) {
    if (goog.DEBUG) {
        console.log("Tracking state", stateName);
    } else if ("_gaq" in window) {
        _gaq.push(["_trackPageview", stateName]);
    }
}
