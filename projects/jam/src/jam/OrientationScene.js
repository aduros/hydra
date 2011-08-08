//
// Fruit Link - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("jam.OrientationScene");

/**
 * @constructor
 * @extends {hydra.Scene}
 */
jam.OrientationScene = function () {
    goog.base(this, "orientation");
}
goog.inherits(jam.OrientationScene, hydra.Scene);

jam.OrientationScene.shouldWarn = function () {
    // Not actually correct, but the easiest thing to get working with Safari's fucking sliding toolbar
    return document.body.offsetWidth > 320 && document.body.offsetHeight < 416;
}

jam.OrientationScene.prototype.load = function () {
    this.root.element.appendChild(hydra.dom.renderDiv(jam.soy.sceneOrientation()));

    this.registerListener(window, "orientationchange", function () {
        if (!jam.OrientationScene.shouldWarn()) {
            hydra.director.popScene();
        }
    });
}
