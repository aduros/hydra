goog.provide("hydra.launcher");

goog.require("goog.userAgent");
goog.require("goog.string");

/**
 * goog.userAgent provides an isVersion, but this one doesn't use a cache
 * @private
 * @return {boolean}
 */
function isVersion (version) {
    return goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0;
}

/**
 * @private
 * @return {string}
 */
function getTarget () {
    if (goog.userAgent.WEBKIT) { // TODO: Find earliest supported version
        return "webkit";
    } else if (goog.userAgent.GECKO) {
        if (isVersion("2.0b")) {
            return "ff4";
        } else if (isVersion("1.8")) {
            return "ff3";
        }
    } else if (goog.userAgent.IE && isVersion("9")) {
        return "ie9";
    } else if (goog.userAgent.OPERA) { // TODO: Find earliest supported version
        return "opera";
    }
    return "unsupported";
}

var script = document.createElement("script");
script.src = "static/app-" + getTarget() + ".js";
document.body.appendChild(script);
