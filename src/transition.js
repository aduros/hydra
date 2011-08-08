//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.Transition");
goog.provide("hydra.SlideTransition");
goog.provide("hydra.FadeTransition");

goog.require("hydra.director");

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

    var width = hydra.director.getStage().clientWidth;
    this.nextScene.getRoot().setX(width);

    var self = this;
    this.addTask(new hydra.task.Sequence([
        new hydra.task.Parallel([
            // TODO: Support non-linear transitions
            hydra.task.MoveTo.linear(-width, 0, this.duration, hydra.director.getPreviousScene().getRoot()),
            hydra.task.MoveTo.linear(0, 0, this.duration, this.nextScene.getRoot())
        ]),
        new hydra.task.CallFunction(function () {
            self.complete();
        })
    ]));
}

/**
 * @constructor
 * @extends {hydra.Transition}
 * @param {hydra.Scene} nextScene
 * @param {number} duration
 */
hydra.FadeTransition = function (nextScene, duration) {
    goog.base(this, nextScene);

    this.duration = duration;
}
goog.inherits(hydra.FadeTransition, hydra.Transition);

hydra.FadeTransition.prototype.load = function () {
    goog.base(this, "load");

    var self = this;
    this.nextScene.getRoot().setCss("opacity", "0");
    this.addTask(new hydra.task.Sequence([
        hydra.task.StyleTo.linear("opacity", "1", this.duration, this.nextScene.getRoot()),
        new hydra.task.CallFunction(function () {
            self.complete();
        })
    ]));
}
