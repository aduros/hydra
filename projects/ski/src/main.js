goog.provide("main");

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

goog.require("ski.MainMenuScene");

goog.scope(function () {
var MainMenuScene = ski.MainMenuScene;

(function () {
    setTimeout(function () { // Wait until safari has been unfucked
        hydra.storage.loadAccount();
        if (!hydra.simulator.supportsTouch) {
            hydra.simulator.init();
        }
        hydra.director.init(new hydra.Scene("splash"));

        hydra.director.pushScene(new ski.AvalancheTransition(new MainMenuScene()));
    }, 0);

    // Safari hacks
    // Looks like android requires it too
    function hideSafari () {
        window.setTimeout(function () {
            window.scrollTo(0, 1); // 1 px is intentional
            if (window.innerHeight < 416) {
                alert("Your screen is very small! Try going into portrait mode for a better fit.");
            }
        }, 0);
    }
    //window.addEventListener("resize", hideSafari, false);
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
