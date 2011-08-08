//
// Fruit Link - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("jam");

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
goog.require("hydra.api.admob");

if (!hydra.simulator.supportsTouch) {
    hydra.simulator.init();
}

if (!goog.DEBUG) {
    //goog.require("hydra.analytics");
    //hydra.analytics.init("UA-9490853-6");
    //goog.require("hydra.kissmetrics");
    //hydra.kissmetrics.init("ef41cc33ba86d1908aaf811e03990d5ef8ef4a81");
}

goog.require("jam.PlayingScene");
goog.require("jam.MainMenuScene");
goog.require("jam.OrientationScene");

hydra.storage.loadAccount();
hydra.director.init(new jam.MainMenuScene());

jam.ctx.music = hydra.sound.play("static/music.mp3");
if (hydra.account["mute"]) {
    jam.ctx.music.pause();
}
// Loop property doesn't work on iOS
jam.ctx.music.addEventListener("ended", HTMLAudioElement.prototype.play, false);

// Fade in
var intro = new hydra.Scene("intro");
var darkness = new hydra.Sprite(hydra.dom.div("darkness"));
darkness.addTask(new hydra.task.Sequence([
   hydra.task.StyleTo.easeIn("opacity", "0", 1),
   new hydra.task.CallFunction(hydra.director.popScene)
]));
intro.addEntity(darkness);
hydra.director.pushScene(intro);

// The correct minimum height should be 464 pixels, but that's too big for the iPhone when
// the status bar is shown. In this case, 4 pixels will be cut off the bottom, alas.
if (window.innerHeight >= 460) {
    jam.adBanner = hydra.dom.div("ad-banner");
    document.body.insertBefore(jam.adBanner, hydra.director.getStage());
    hydra.api.admob.init("a14d29ad54cb70e", jam.adBanner);
}

// Orientation handling
function onOrientationChanged () {
    if (jam.OrientationScene.shouldWarn() & !(hydra.director.getCurrentScene() instanceof jam.OrientationScene)) {
        hydra.director.pushScene(new jam.OrientationScene());
    }
}
window.addEventListener("orientationchange", onOrientationChanged, false);
onOrientationChanged();

// Safari hacks
// Looks like android requires it too
function hideSafari () {
    window.setTimeout(window.scrollTo, 0, 1, 0); // 1 px is intentional
}
//window.addEventListener("load", hideSafari, false); // TODO: Can be DOMContentloaded?
window.addEventListener("resize", hideSafari, false);
document.addEventListener("touchstart", function (event) {
    event.preventDefault();
    window.scrollTo(0, 1);
}, true);
window.scrollTo(0, 1);

// App caching
if ("applicationCache" in window) {
    applicationCache.addEventListener("updateready", applicationCache.swapCache, false);
    if (applicationCache.status == 2) {
        applicationCache.update();
    }
}
