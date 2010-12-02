goog.provide("hydra.Transition");
goog.provide("hydra.SlideTransition");

// TODO: Slide, fade, zoom scene transitions, etc, etc

/**
 * @constructor
 * @extends {hydra.Scene}
 */
hydra.Transition = function (nextScene) {
    goog.base(this, "transition");

    /**
     * @protected
     * @type {hydra.Scene}
     */
    this.nextScene = nextScene;

//    this.addUpdatable(toScene);
}
goog.inherits(hydra.Transition, hydra.Scene);

hydra.Transition.prototype.load = function () {
    hydra.director.insertScene(this.nextScene, 0);
}

hydra.Transition.prototype.complete = function () {
    hydra.director.unwindToScene(this.nextScene);
}

/**
 * @constructor
 * @extends {hydra.Transition}
 * @param {hydra.Scene} nextScene
 * @param {number} duration
 */
hydra.SlideTransition = function (nextScene, duration) {
    goog.base(this, nextScene);

    this.duration = duration;
}
goog.inherits(hydra.SlideTransition, hydra.Transition);

hydra.SlideTransition.prototype.load = function () {
    goog.base(this, "load");

    this.nextScene.getRoot().setX(320); // TODO: Support larger resolutions
    var self = this;
    this.addTask(new hydra.task.Sequence([
        new hydra.task.Parallel([
            // TODO: Support non-linear transitions
            hydra.task.MoveTo.linear(-320, 0, this.duration, hydra.director.getPreviousScene().getRoot()),
            hydra.task.MoveTo.linear(0, 0, this.duration, this.nextScene.getRoot())
        ]),
        new hydra.task.CallFunction(function () {
            self.complete();
        })
    ]));
}
