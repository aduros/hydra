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
    window["SpilGames"]["Highscores"]["showScoreboard"](function () {});
}

hydra.api.spil.exists = function () {
    return "SpilGames" in window;
}
