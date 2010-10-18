goog.provide("tetris.OrientationScene");

/**
 * @constructor
 * @extends {hydra.Scene}
 */
tetris.OrientationScene = function () {
    goog.base(this, "orientation");
}
goog.inherits(tetris.OrientationScene, hydra.Scene);

tetris.OrientationScene.shouldWarn = function () {
    // Not actually correct, but the easiest thing to get working with Safari's fucking sliding toolbar
    return document.body.offsetWidth > 320 && document.body.offsetHeight < 416;
}

tetris.OrientationScene.prototype.load = function () {
    this.root.element.appendChild(hydra.dom.renderDiv(tetris.soy.sceneOrientation()));

    this.registerListener(window, "orientationchange", function () {
        if (!tetris.OrientationScene.shouldWarn()) {
            hydra.director.popScene();
        }
    });
}
