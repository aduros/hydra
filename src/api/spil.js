//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.api.spil");

/**
 * @param {number} score
 */
hydra.api.spil.submitScore = function (score) {
    try {
        window["SpilGames"]["Highscores"]["insert"]({"score": score});
    } catch (_) {
    }
}

hydra.api.spil.showScores = function () {
    try {
        window["SpilGames"]["Highscores"]["showScoreboard"](function () {});
    } catch (_) {
    }
}

hydra.api.spil.getSplashURL = function () {
    try {
        return window["SpilGames"]["Settings"]["get"]("currentGameInfo")["splashScreen"] || null;
    } catch (_) {
        return null;
    }
}

hydra.api.spil.exists = function () {
    return "SpilGames" in window;
}
