goog.provide("tetris.main");

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

if (!hydra.simulator.supportsTouch) {
    hydra.simulator.init();
}

//if (!goog.DEBUG) {
//    goog.require("hydra.analytics");
//    hydra.analytics.init("UA-9490853-6");
//}

goog.require("tetris.PlayingScene");
goog.require("tetris.OrientationScene");

hydra.storage.loadAccount();
hydra.director.init(new tetris.MainMenuScene(false));

// Fade in
var intro = new hydra.Scene("intro");
var darkness = new hydra.Sprite(hydra.dom.div("darkness"));
darkness.addTask(new hydra.task.Sequence([
    hydra.task.StyleTo.easeIn("opacity", "0", 1),
    new hydra.task.CallFunction(hydra.director.popScene)
]));
intro.addEntity(darkness);
hydra.director.pushScene(intro);

// Orientation handling
function onOrientationChanged () {
    if (tetris.OrientationScene.shouldWarn() & !(hydra.director.getCurrentScene() instanceof tetris.OrientationScene)) {
        hydra.director.pushScene(new tetris.OrientationScene());
    }
}
window.addEventListener("orientationchange", onOrientationChanged, false);
onOrientationChanged();

// Safari hacks
// Looks like android requires it too
function hideSafari () {
    window.setTimeout(window.scrollTo, 0, 1, 0); // 1 px is intentional
}
window.addEventListener("resize", hideSafari, false);
document.addEventListener("touchstart", function (event) {
    event.preventDefault();
    window.scrollTo(0, 1);
}, true);
window.scrollTo(0, 1);

// Allows keyboard events when embedded in an iframe
if (window.top != window) {
    window.addEventListener("click", function (event) {
        window.focus();
    }, true);
}

// App caching
if ("applicationCache" in window) {
    applicationCache.addEventListener("updateready", applicationCache.swapCache, false);
    if (applicationCache.status == 2) {
        applicationCache.update();
    }
}
