goog.provide("jam.PlayingScene");

goog.require("hydra.Scene");
goog.require("hydra.task.SetCss");

goog.require("jam.Board");
goog.require("jam.BoardSprite");
goog.require("jam.ctx");

/**
 * @constructor
 * @extends {hydra.Scene}
 */
jam.PlayingScene = function () {
    goog.base(this, "playing");
}
goog.inherits(jam.PlayingScene, hydra.Scene);

jam.PlayingScene.prototype.load = function () {
    jam.ctx.board = new jam.Board();

    this.clock = new hydra.Sprite(hydra.dom.div("clock"));
    this.clock.setXY(200, 10);
    var self = this;
    this.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        new hydra.task.Delay(1),
        new hydra.task.CallFunction(function () {
            self.updateClock();
        })
    ])));
    this.clock.registerListener(jam.ctx.board, jam.BoardEvent.SCORE_CHANGED, goog.bind(this.onScoreChanged, this));
    this.clock.registerListener(jam.ctx.board, jam.BoardEvent.GAME_OVER, goog.bind(this.onGameOver, this));
    this.addEntity(this.clock);

    this.score = new hydra.Sprite(hydra.dom.div("score"));
    this.score.setXY(32, 10);
    this.addEntity(this.score);

    var clockIcon = new hydra.Sprite(hydra.dom.div("clock-icon"));
    clockIcon.setXY(320-40, 10);
    this.addEntity(clockIcon);

    var pauseButton = new hydra.Button(hydra.dom.div("pause-button"));
    pauseButton.setXY(0, 10);
    pauseButton.onTap = function () {
        var pauseScene = new hydra.Scene("pause");
        var fader = new hydra.Group(hydra.dom.div("fader"));
        fader.element.style.opacity = "0";
        fader.registerListener(document, "touchstart", function () {
            fader.removeAllTasks();
            fader.addTask(new hydra.task.Sequence([
                hydra.task.AnimateCss.linear("opacity", "0", 0.5),
                new hydra.task.CallFunction(hydra.director.popScene)
            ]));
        });
        fader.addTask(hydra.task.AnimateCss.linear("opacity", "0.9", 0.5));
        pauseScene.addEntity(fader);

        var label = new hydra.Sprite(hydra.dom.div("paused"));
        label.element.innerText = "PAUSED";
        label.setXY(320, 416/2-50);
        label.addTask(hydra.task.MoveTo.easeOut(320/2-80, 416/2-50, 1));
        fader.addSprite(label);

        hydra.director.pushScene(pauseScene);
    }
    this.addEntity(pauseButton);

//    jam.ctx.board.startGame();

    var board = new jam.BoardSprite();
    board.setY(56-3);
    this.addEntity(board);

    var interstitial = new hydra.Scene("interstitial");
    var ready = new hydra.Sprite(hydra.dom.div("ready"));
    ready.setXY(60, 0);
    ready.element.innerText = "Ready...";
    ready.element.style.opacity = "0";
    ready.addTask(hydra.task.AnimateCss.linear("opacity", "1", 1));
    ready.addTask(new hydra.task.Sequence([
        hydra.task.MoveTo.linear(60, 416/3, 2),
        new hydra.task.CallFunction(function () {
            var go = new hydra.Sprite(hydra.dom.div("go"));
            go.element.innerText = "GO!";
            go.setXY(60, 416/3);
            go.setScale(0.5);
            go.addTask(new hydra.task.Sequence([
                hydra.task.ScaleTo.easeOut(1, 1, 0.5),
                new hydra.task.SelfDestruct()
            ]));
            self.addEntity(go);
            hydra.director.popScene();
            jam.ctx.board.startGame();
        })
    ]));
    interstitial.addEntity(ready);
    hydra.director.pushScene(interstitial);
}

jam.PlayingScene.prototype.onScoreChanged = function () {
    if (jam.ctx.board.pathList.length) {
        this.score.removeAllTasks();
        this.score.addTask(new hydra.task.Sequence([
            hydra.task.ScaleTo.easeOut(1.2, 1.2, 0.1),
            hydra.task.ScaleTo.easeIn(1, 1, 0.1)
        ]));
    }
    this.score.element.innerText = String(jam.ctx.board.score);
}

jam.PlayingScene.prototype.updateClock = function () {
    var remaining = hydra.math.toInt((jam.ctx.board.gameOverTime - Date.now())/1000);
    if (remaining >= 0) {
        var mins = hydra.math.toInt(remaining / 60);
        var secs = remaining % 60;
        this.clock.element.innerText = mins + ((secs > 9) ? ":" : ":0") + secs;
        if (remaining < 10) {
            this.clock.setCss("color", "red");
        }
    } else {
        jam.ctx.board.endGame();
    }
}

jam.PlayingScene.prototype.onGameOver = function () {
    var best = jam.ctx.account["best"] || 0;
    if (jam.ctx.board.score > best) {
        best = jam.ctx.board.score;
        jam.ctx.account["best"] = best;
        jam.ctx.saveAccount();
    }
    alert("Game over! You scored " + jam.ctx.board.score +
        ", your personal best is " + best + "." +
        "\n" +
        "\n" +
        "Bruno Garcia built this for a 2 day game jam.");
    hydra.director.unwindToScene(new jam.PlayingScene());
}
