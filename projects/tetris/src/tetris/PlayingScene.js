//
// Block Dream - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("tetris.PlayingScene");

goog.require("hydra.Scene");
//goog.require("hydra.Music");

goog.require("tetris.Board");
goog.require("tetris.BoardSprite");
goog.require("tetris.Piece");
goog.require("tetris.Marquee");
goog.require("tetris.PieceSprite");
goog.require("tetris.soy");
goog.require("tetris.PauseScene");
goog.require("tetris.GameOverScene");
goog.require("tetris.ctx");

/**
 * @enum {number}
 */
tetris.InputState = {
    NONE: 0,
    TAPPING: 1,
    DRAGGING: 2
};

/**
 * @constructor
 * @extends {hydra.Scene}
 */
tetris.PlayingScene = function () {
    goog.base(this, "playing");
}
goog.inherits(tetris.PlayingScene, hydra.Scene);

tetris.PlayingScene.prototype.load = function () {
//    this.addEntity(new hydra.ui.ScrollPreventer());

    var ui = hydra.dom.renderDiv(tetris.soy.scenePlaying());
    this.score = new hydra.Sprite(ui.querySelector(".ui-score"));
    this.addEntity(this.score, null);

    this.uiPreview = ui.querySelector(".ui-preview");
    this.level = new hydra.Sprite(ui.querySelector(".ui-level"));
    this.addEntity(this.level, null);

    this.root.element.appendChild(ui);

    var pauseButton = new hydra.Button(ui.querySelector(".button-pause"));
    pauseButton.onTap = function () {
        hydra.director.pushScene(new tetris.PauseScene());
    };
    this.addEntity(pauseButton, null);

//    var shouldMute = hydra.account["mute"];
//    tetris.ctx.music = new hydra.Music("static/music.mp3");
//    tetris.ctx.music.setEnabled(!shouldMute);
//    this.addEntity(tetris.ctx.music);
//
//    var volumeButton = new hydra.ui.TouchButton(ui.querySelector(".button-volume"));
//    volumeButton.onTap = function () {
//        var oldValue = volumeButton.isToggled();
//        tetris.ctx.music.setEnabled(oldValue);
//        hydra.account["mute"] = !oldValue;
//        hydra.storage.saveAccount();
//        volumeButton.setToggled(!oldValue);
//    };
//    volumeButton.setToggled(shouldMute);
//    this.addEntity(volumeButton, null);

    tetris.ctx.board = new tetris.Board();

    var uiBoard = ui.querySelector(".ui-board");
    this.marquee = new tetris.Marquee();
    this.marquee.setY(40);

    if (!("lastGame" in hydra.account)) {
        this.marquee.setText(hydra.simulator.supportsTouch ?
            tetris.soy.introTouch() : tetris.soy.introKeyboard());
    }

    this.addEntity(this.marquee, uiBoard);

    var boardSprite = new tetris.BoardSprite();
    this.addEntity(boardSprite, uiBoard);

    this.registerListener(tetris.ctx.board, tetris.BoardEvent.GAME_OVER, goog.bind(this.onGameOver, this));
    this.registerListener(tetris.ctx.board, tetris.BoardEvent.NEXT_PIECE, goog.bind(this.onNextPiece, this));
    this.registerListener(tetris.ctx.board, tetris.BoardEvent.SCORE_CHANGED, goog.bind(this.onScoreChanged, this));
    this.registerListener(tetris.ctx.board, tetris.BoardEvent.LEVEL_CHANGED, goog.bind(this.onLevelChanged, this));

    //this.registerListener(window.frameElement, "keydown", goog.bind(this.onKeyDown, this));
    this.registerListener(window, "keydown", goog.bind(this.onKeyDown, this));

    this.inputState = tetris.InputState.NONE;
    this.registerListener(window, "touchstart", goog.bind(this.onTouchStart, this));
    this.registerListener(window, "touchmove", goog.bind(this.onTouchMove, this));
    this.registerListener(window, "touchend", goog.bind(this.onTouchEnd, this));

    this.stepDelay = new hydra.task.Delay(1);
    this.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        this.stepDelay,
        new hydra.task.CallFunction(function () {
            tetris.ctx.board.step();
        })
    ])));

    tetris.ctx.board.startGame();
}

tetris.PlayingScene.prototype.onGameOver = function () {
    hydra.director.pushScene(new tetris.GameOverScene());
}

tetris.PlayingScene.prototype.onNextPiece = function (p, preview) {
    if (this.previewSprite) {
        this.previewSprite.destroy();
    }
    this.previewSprite = new tetris.PieceSprite(preview);
    this.addEntity(this.previewSprite, this.uiPreview);

//    this.inputState = tetris.InputState.NONE;
}

tetris.PlayingScene.prototype.onScoreChanged = function () {
    this.score.element.textContent = String(tetris.ctx.board.score);
    if (tetris.ctx.board.score > 0) {
        this.score.setScale(2);
        this.score.addTask(hydra.task.ScaleTo.easeIn(1, 1, 1));
    }
}

tetris.PlayingScene.prototype.onLevelChanged = function () {
    this.stepDelay.delay = 1000/tetris.ctx.board.level;
    this.level.element.textContent = "LVL " + tetris.ctx.board.level;
    if (tetris.ctx.board.level > 1) {
        this.marquee.setText(tetris.soy.levelUp(tetris.ctx.board));
        this.level.setScale(2);
        this.level.addTask(hydra.task.ScaleTo.easeIn(1, 1, 1));
    }
}

tetris.PlayingScene.prototype.onKeyDown = function (event) {
    if (!this.isCurrentScene()) {
        return;
    }
    switch (event.keyCode) {
        case 27:
            hydra.director.pushScene(new tetris.PauseScene());
            break;
        case 37:
            tetris.ctx.board.movePiece(-1, 0);
            break;
        case 39:
            tetris.ctx.board.movePiece(1, 0);
            break;
        case 38:
            tetris.ctx.board.rotate();
            break;
        case 40:
            tetris.ctx.board.drop();
            break;
        default:
            return;
    }
    event.preventDefault();
}

tetris.PlayingScene.prototype.onTouchStart = function (event) {
    if (!this.isCurrentScene()) {
        return;
    }
    var touch = event.touches[0];
    this.lastMoveX = touch.clientX;
    this.inputState = tetris.InputState.TAPPING;

//    this.maxVX = 0;
//    this.maxVY = 0;
//    this.lastTouch = touch;
//    this.lastTouchTime = event.timeStamp;
    this.touchAY = touch.clientY;
    this.touchATime = event.timeStamp;
    this.touchBY = null;
    this.touchBTime = null;
}

tetris.PlayingScene.prototype.onTouchMove = function (event) {
    if (!this.isCurrentScene()) {
        return;
    }
    var touch = event.touches[0];

//    this.touchBX = this.touchAX;
    this.touchBY = this.touchAY;
    this.touchBTime = this.touchATime;
//    this.touchAX = touch.clientX;
    this.touchAY = touch.clientY;
    this.touchATime = event.timeStamp;
//    var dt = event.timeStamp - this.lastTouchTime;
//
//    var vx = (touch.clientX - this.lastTouch.clientX) / dt;
//    if (hydra.math.abs(vx) > hydra.math.abs(this.maxVX)) {
//        this.maxVX = vx;
//    }
//    var vy = (touch.clientY - this.lastTouch.clientY) / dt;
//    if (hydra.math.abs(vy) > hydra.math.abs(this.maxVY)) {
//        this.maxVY = vy;
//    }
//    this.lastTouch = touch;
//    this.lastTouchTime = event.timeStamp;

    var dx = touch.clientX - this.lastMoveX;
    if (dx > tetris.BoardSprite.BLOCK_SIZE) {
        tetris.ctx.board.movePiece(1, 0);
    } else if (dx < -tetris.BoardSprite.BLOCK_SIZE) {
        tetris.ctx.board.movePiece(-1, 0);
    } else {
        return;
    }
    this.lastMoveX = touch.clientX;
    this.inputState = tetris.InputState.DRAGGING;
}

tetris.PlayingScene.prototype.onTouchEnd = function (event) {
    if (!this.isCurrentScene()) {
        return;
    }
    var touch = event.changedTouches[0];
    if (this.touchBTime && (this.touchAY - this.touchBY)/(this.touchATime - this.touchBTime) > 0.25) {
        tetris.ctx.board.drop();
    } else if (this.inputState == tetris.InputState.TAPPING) {
        tetris.ctx.board.rotate();
    }
    this.inputState = tetris.InputState.NONE;
    this.touchATime = 0;
}
