//
// Blast Effect - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("chain");

goog.require("hydra.dom");
goog.require("hydra.director");
goog.require("hydra.dom");
goog.require("hydra.math");
goog.require("hydra.Scene");
goog.require("hydra.Sprite");
goog.require("hydra.task.StyleTo");
goog.require("hydra.task.CallFunction");
goog.require("hydra.task.Delay");
goog.require("hydra.task.MoveTo");
goog.require("hydra.task.MoveBy");
goog.require("hydra.task.Repeat");
goog.require("hydra.task.ScaleTo");
goog.require("hydra.task.Sequence");
goog.require("hydra.task.RotateBy");
goog.require("hydra.task.RotateTo");
goog.require("hydra.Button");
goog.require("hydra.storage");
goog.require("hydra.simulator");
goog.require("hydra.sound");
goog.require("hydra.api.playtomic");
goog.require("hydra.api.admob");

goog.require("chain.PlayingScene");
goog.require("chain.MainMenuScene");

goog.scope(function () {
var PlayingScene = chain.PlayingScene;
var MainMenuScene = chain.MainMenuScene;

(function () {
    if (!goog.DEBUG) {
        hydra.api.playtomic.init(1403, "d60e926aad9b4055");
    }
    //window["Playtomic"]["Leaderboards"]["Submit"]({
    //    "Name": "testycakes",
    //    "Points": Math.random()*500
    //}, "highscores");
    //window["Playtomic"]["Leaderboards"]["List"]({
    //    "Name": "testycakes",
    //    "Points": Math.random()*500

    hydra.storage.loadAccount();
    if (!hydra.simulator.supportsTouch) {
        hydra.simulator.init();
    }
    hydra.director.init(new MainMenuScene());

    // The correct minimum height should be 464 pixels, but that's too big for the iPhone when
    // the status bar is shown. In this case, 4 pixels will be cut off the bottom, alas.
    if (window.innerHeight >= 460) {
        chain.adBanner = hydra.dom.div("ad-banner");
        document.body.insertBefore(chain.adBanner, hydra.director.getStage());
        hydra.api.admob.init("a14d2a42068bd5a", chain.adBanner);
    }

    // Safari hacks
    // Looks like android requires it too
    function hideSafari () {
        window.setTimeout(function () {
            window.scrollTo(0, 1); // 1 px is intentional
            if (chain.OrientationScene.shouldWarn() &&
                !(hydra.director.getCurrentScene() instanceof chain.OrientationScene)) {
                hydra.director.pushScene(new chain.OrientationScene());
            }
        }, 0);
    }
    window.addEventListener("orientationchange", hideSafari, false);
    document.addEventListener("touchstart", function (event) {
        event.preventDefault();
        window.scrollTo(0, 1);
    }, true);
    window.scrollTo(0, 1);

    //// Allows keyboard events when embedded in an iframe
    //if (window.top != window) {
    //    window.addEventListener("click", function (event) {
    //        window.focus();
    //    }, true);
    //}

    //// App caching
    //if (hydra.platform.HAS_APP_CACHE && "applicationCache" in window) {
    //    applicationCache.addEventListener("updateready", applicationCache.swapCache, false);
    //    if (applicationCache.status == 2) {
    //        applicationCache.update();
    //    }
    //}
})();

});
