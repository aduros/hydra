//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.api.yoc");

goog.require("hydra.director");
goog.require("hydra.Scene");
goog.require("hydra.Sprite");

/**
 * @param {Element} element
 * @param {number} adId
 */
hydra.api.yoc.showAd = function (element, adId) {
    try {
        element.id = "adspace_" + adId;
        window["createAdJS"](adId);
    } catch (_) {
        // Press on
    }
}

/**
 * @constructor
 * @extends {hydra.Scene}
 * @param {number} adId
 * @param {hydra.Scene} nextScene
 */
hydra.api.yoc.InterstitialScene = function (adId, nextScene) {
    goog.base(this, "yoc-interstitial");
    this.adId = adId;
    this.nextScene = nextScene;
}
goog.inherits(hydra.api.yoc.InterstitialScene, hydra.Scene);

hydra.api.yoc.InterstitialScene.prototype.load = function () {
    // YOC supplies interstitial images that don't fit. Le sigh.
    var hack = document.createElement("style");
    hack.setAttribute("type", "text/css");
    this.addEntity(new hydra.Sprite(hack), document.getElementsByTagName("head")[0]);
    document.styleSheets[document.styleSheets.length-1].insertRule(
        ".AdMobileImg {" +
            "height: " + window.innerHeight + "px;" +
        "}", 0);

    var adContainer = document.getElementById("yoc-container");

    var ad = new hydra.Sprite();
    // Deliberately place the ad outside of the stage
    this.addEntity(ad, adContainer);
    hydra.api.yoc.showAd(ad.element, this.adId);

    var nextScene = this.nextScene;
    this.addTask(new hydra.task.Sequence([
        new hydra.task.Delay(5),
        new hydra.task.CallFunction(function () {
            hydra.director.replaceScene(nextScene);
        })
    ]));
};
