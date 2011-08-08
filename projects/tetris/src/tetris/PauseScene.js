//
// Block Dream - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("tetris.PauseScene");

goog.require("hydra.Scene");

goog.require("tetris.MainMenuScene");
goog.require("tetris.soy");

/**
 * @constructor
 * @extends {hydra.Scene}
 */
tetris.PauseScene = function () {
    goog.base(this, "pause");
}
goog.inherits(tetris.PauseScene, hydra.Scene);

tetris.PauseScene.prototype.load = function () {
    var ui = hydra.dom.renderDiv(tetris.soy.scenePause());
    this.root.element.appendChild(ui);

    this.root.setXY(-320, 100);
    this.root.setCss("opacity", "0");
    this.addTask(hydra.task.MoveTo.linear(0, 100, 0.2));
    this.addTask(hydra.task.StyleTo.linear("opacity", "1", 0.2));

    // Fade in
//    this.root.element.style.opacity = "0";

//    var label = new hydra.Sprite(ui.querySelector(".label-pause"));
//    this.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
//        hydra.task.ScaleTo.linear(2, 2, 0.5, label),
//        hydra.task.ScaleTo.linear(1, 1, 0.5, label)
//    ])));
//    // Don't add the label or it will be reparented
//    // TODO Figure out a way to handle this common pattern of pulling Sprites out of soy templates
    var self = this;
    var resume = new hydra.Button(ui.querySelector(".button-resume"));
    resume.onTap = function () {
        self.addTask(new hydra.task.Sequence([
            hydra.task.StyleTo.linear("opacity", "0", 0.2),
            new hydra.task.CallFunction(hydra.director.popScene)
        ]));
    };
    this.addEntity(resume, null);

    var quit = new hydra.Button(ui.querySelector(".button-quit"));
    quit.onTap = function () {
        hydra.director.popScene(); // Pop to PlayingScene
        hydra.director.pushScene(tetris.MainMenuScene.createTransition());
    };
    this.addEntity(quit, null);

//    var self = this;
//    this.registerListener(document, "touchstart", function () {
//        self.removeAllTasks();
//        self.addTask(new hydra.task.Sequence([
//            hydra.task.StyleTo.linear("opacity", "0", 0.2),
//            new hydra.task.CallFunction(hydra.director.popScene)
//        ]));
//    });
}
