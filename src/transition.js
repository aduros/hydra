goog.provide("hydra.Transition");

// TODO: Slide, fade, zoom scene transitions, etc, etc

/**
 * @constructor
 * @extends {hydra.Scene}
 */
hydra.Transition = function (toScene) {
    goog.base(this, "transition");

    /**
     * @private
     * @type {hydra.Scene}
     */
    this.toScene = toScene;

//    this.addUpdatable(toScene);
}
goog.inherits(hydra.Transition, hydra.Scene);

hydra.Transition.prototype.load = function () {
    hydra.director.insertScene(this.toScene, 0);
}

hydra.Transition.prototype.complete = function () {
    hydra.director.unwindToScene(this.toScene);
}
