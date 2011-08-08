//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.api.zeewe");

goog.require("goog.Uri");

hydra.api.zeewe.getUserId = function () {
    return goog.Uri.parse(document.location.href).getParameterValue("zeewe_user");
}

/**
 * @param {number} score
 */
hydra.api.zeewe.redirectWithScore = function (score) {
    document.location = "gameover?zeewe_user=" +
        hydra.api.zeewe.getUserId() + "&score=" + score;
}

/**
 * Whether this is a redirect back from Zeewe.
 */
hydra.api.zeewe.isReturning = function () {
    return goog.Uri.parse(document.location.href).getParameterValue("scene") == "playing";
}
