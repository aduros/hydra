goog.provide("tetris.MainMenuScene");

goog.require("hydra.string");
goog.require("hydra.Transition");

//goog.require("tetris.PlayingScene");
goog.require("tetris.soy");

/**
 * @constructor
 * @param {boolean} animate
 * @extends {hydra.Scene}
 */
tetris.MainMenuScene = function (animate) {
    goog.base(this, "mainmenu");
    this.animate = animate;
}
goog.inherits(tetris.MainMenuScene, hydra.Scene);

tetris.MainMenuScene.SLIDE_TIME = 0.5;
tetris.MainMenuScene.TRANSITION_TIME = 1;

tetris.MainMenuScene.prototype.load = function () {
    var ui = hydra.dom.renderDiv(tetris.soy.sceneMainMenu());
    this.root.element.appendChild(ui);

    var credits = new hydra.Button(ui.querySelector(".credits"));
    credits.onTap = function () {
        window.top.location = "http://twitter.com/b_garcia";
    };
    this.addEntity(credits, null);

    var attract = new hydra.Group();
    this.addEntity(attract, ui.querySelector(".ui-attract"));

    attract.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        new hydra.task.CallFunction(function () {
            var p = tetris.Piece.createRandom();
            if (p != tetris.Piece.PRESETS[0]) {
                for (var ii = 0, n = hydra.math.randomInt(0, 4); ii < n; ++ii) {
                    p = p.rotate();
                }
            }
            var fallingPiece = new tetris.PieceSprite(p);
            fallingPiece.setXY(hydra.math.randomInt(0, 320), 450);
            var z = hydra.math.random()*4+1;
            fallingPiece.setScale(2/z);
            fallingPiece.addTask(new hydra.task.Sequence([
                hydra.task.MoveBy.linear(0, -480, z),
                new hydra.task.SelfDestruct()
            ]));
            attract.addSprite(fallingPiece);
        }),
        new hydra.task.Delay(0.1)
    ])));

    this.createMainSprite(false);
}

tetris.MainMenuScene.prototype.createMainSprite = function (animate) {
    var mainSprite = new hydra.Group(hydra.dom.renderDiv(tetris.soy.mainMenu()));
    this.addEntity(mainSprite);
    var height = mainSprite.element.offsetHeight;

    if (animate || this.animate) {
        mainSprite.setY(-height);
        mainSprite.addTask(hydra.task.MoveTo.easeOut(0, 0, tetris.MainMenuScene.SLIDE_TIME));
    }

    var play = new hydra.Button(mainSprite.element.querySelector(".button-play"));
    play.onTap = function () {
        var current = hydra.director.getCurrentScene();
        var next = new tetris.PlayingScene();
        next.getRoot().setY(416);

        var transition = new hydra.Transition(next);
        transition.addUpdatable(current);
        transition.addTask(new hydra.task.Sequence([
            new hydra.task.Parallel([
                hydra.task.MoveTo.linear(0, -416, tetris.MainMenuScene.TRANSITION_TIME, current.getRoot()),
                hydra.task.StyleTo.linear("opacity", "0.2", tetris.MainMenuScene.TRANSITION_TIME/2, current.getRoot()),
                hydra.task.MoveTo.linear(0, 0, tetris.MainMenuScene.TRANSITION_TIME, next.getRoot())
            ]),
            new hydra.task.CallFunction(function () {
                transition.complete();
            })
        ]));
        hydra.director.pushScene(transition);
    };
//    mainSprite.addSprite(play);
//    console.log("Creating play button");
    play.activate(this); // HACK

    var scores = new hydra.Button(mainSprite.element.querySelector(".button-scores"));
    scores.onTap = function () {
        mainSprite.addTask(new hydra.task.Sequence([
            hydra.task.MoveTo.easeOut(0, -height, tetris.MainMenuScene.SLIDE_TIME),
            new hydra.task.CallFunction(function (dt, e) {
                var scene = mainSprite.getScene();
                mainSprite.destroy();
                scene.createScoreSprite();
            })
        ]));
    };
//    mainSprite.addSprite(scores);
    scores.activate(this); // HACK
}

tetris.MainMenuScene.prototype.createScoreSprite = function () {
    var scores;
    if ("scores" in hydra.account) {
        var now = Date.now();
        scores = hydra.account["scores"].map(function (x) {
            return {
                score: x["score"],
                date: hydra.string.fromDate(x["date"], now)
            }
        });
    } else {
        scores = [];
    }
    var scoreSprite = new hydra.Group(hydra.dom.renderDiv(
        tetris.soy.scoreMenu({scores: scores})));
    this.addEntity(scoreSprite);
    var height = scoreSprite.element.offsetHeight;

    var back = new hydra.Button(scoreSprite.element.querySelector(".button-back"));
    back.onTap = function () {
        scoreSprite.addTask(new hydra.task.Sequence([
            hydra.task.MoveTo.easeOut(0, -height, tetris.MainMenuScene.SLIDE_TIME),
            new hydra.task.CallFunction(function (dt, e) {
                var scene = scoreSprite.getScene();
                scoreSprite.destroy();
                scene.createMainSprite(true);
            })
        ]));
    };
    back.activate(this); // HACK

    scoreSprite.setY(-height);
    scoreSprite.addTask(hydra.task.MoveTo.easeOut(0, 0, tetris.MainMenuScene.SLIDE_TIME));
}

tetris.MainMenuScene.createTransition = function () {
    var current = hydra.director.getCurrentScene();
    var next = new tetris.MainMenuScene(true);
    next.getRoot().setY(-416);

    var transition = new hydra.Transition(next);
    transition.addTask(new hydra.task.Sequence([
        new hydra.task.Parallel([
            hydra.task.MoveTo.linear(0, 416, tetris.MainMenuScene.TRANSITION_TIME, current.getRoot()),
            hydra.task.StyleTo.linear("opacity", "0.2", tetris.MainMenuScene.TRANSITION_TIME/2, current.getRoot()),
            hydra.task.MoveTo.linear(0, 0, tetris.MainMenuScene.TRANSITION_TIME, next.getRoot())
        ]),
        new hydra.task.CallFunction(function () {
            transition.complete();
        })
    ]));
    return transition;
}
