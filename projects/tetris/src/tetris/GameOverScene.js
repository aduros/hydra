goog.provide("tetris.GameOverScene");

goog.require("hydra.Scene");

goog.require("tetris.soy");
goog.require("tetris.MainMenuScene");

/**
 * @constructor
 * @extends {hydra.Scene}
 */
tetris.GameOverScene = function () {
    goog.base(this, "gameover");
}
goog.inherits(tetris.GameOverScene, hydra.Scene);

tetris.GameOverScene.prototype.load = function () {

//    hydra.analytics.trackEvent("gameplay", "finishGame", tetris.ctx.board.score);

    hydra.account["lastGame"] = Date.now();

    var scores = hydra.account["scores"];
    if (!scores) {
        hydra.account["scores"] = scores = [];
    }
    for (var rank = 0; rank < scores.length; ++rank) {
        var scoreRecord = scores[rank];
        if (scoreRecord["score"] < tetris.ctx.board.score) {
            break;
        }
    }
    scores.splice(rank, 0, {"date": Date.now(), "score": tetris.ctx.board.score});
    if (scores.length > 10) {
        scores.length = 10;
    }
    hydra.storage.saveAccount();

    var ui = hydra.dom.renderDiv(tetris.soy.sceneGameOver({
        score: tetris.ctx.board.score,
        level: tetris.ctx.board.level,
        isHighScore: (rank==0)
    }));
    this.root.element.appendChild(ui);

    this.root.setXY(320, 100);
    this.root.setCss("opacity", "0");
    this.addTask(hydra.task.MoveTo.linear(0, 100, 0.2));
    this.addTask(hydra.task.StyleTo.linear("opacity", "1", 0.2));

    var replay = new hydra.Button(ui.querySelector(".button-replay"));
    replay.onTap = function () {
        hydra.director.unwindToScene(new tetris.PlayingScene());
    };
    this.addEntity(replay, null);

    var quit = new hydra.Button(ui.querySelector(".button-quit"));
    quit.onTap = function () {
        hydra.director.popScene(); // Pop to PlayingScene
        hydra.director.pushScene(tetris.MainMenuScene.createTransition());
    };
    this.addEntity(quit, null);
}
