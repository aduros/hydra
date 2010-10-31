goog.provide("jam.MainMenuScene");

goog.require("hydra.string");
goog.require("hydra.SlideTransition");

//goog.require("jam.PlayingScene");
goog.require("jam.soy");

/**
 * @constructor
 * @extends {hydra.Scene}
 */
jam.MainMenuScene = function () {
    goog.base(this, "mainmenu");
}
goog.inherits(jam.MainMenuScene, hydra.Scene);

jam.MainMenuScene.prototype.load = function () {
    var ui = hydra.dom.renderDiv(jam.soy.sceneMainMenu());
    this.root.element.appendChild(ui);

    var credits = new hydra.Button(ui.querySelector(".credits"));
    credits.onTap = function () {
        window.top.location = "http://twitter.com/b_garcia";
    };
    this.addEntity(credits, null);

    var logo = new hydra.Button(ui.querySelector(".logo"));
    logo.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        hydra.task.ScaleTo.easeIn(1.1, 1, 2),
        hydra.task.ScaleTo.easeOut(1, 1, 2)
    ])));
    this.addEntity(logo, null);

    var attract = new hydra.Group();
    for (var ii = 0; ii < 15; ++ii) {
        var bug = hydra.Sprite.div("block0");
        bug.setXY(hydra.math.randomInt(0, 320), hydra.math.randomInt(0, 400));
        bug.setRotation(hydra.math.randomInt(0, 360));
        bug.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
           new hydra.task.Delay(hydra.math.random()*4+1.5),
           new hydra.task.CallFunction(function (dt, bug) {
               var x = hydra.math.randomInt(0, 320);
               var y = hydra.math.randomInt(0, 400)
               var dx = x - bug.getX();
               var dy = y - bug.getY();
               var r = hydra.math.toDegrees(Math.atan(dy/dx)) + (dx>0 ? 270 : 90);
               bug.setRotation(r);
               bug.addTask(hydra.task.MoveTo.easeOut(x, y, 1));
           })
        ])));
        (function (bug) { // Easter egg!
            bug.registerListener(bug.element, "touchstart", function () {
                bug.removeAllTasks();
                bug.setRotation(0);
                bug.element.className = "block" + hydra.math.randomInt(1, jam.Board.TILE_TYPES);
            });
        })(bug);
        attract.addSprite(bug);
    }

    this.addEntity(attract, ui.querySelector(".ui-attract"));

    attract.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        new hydra.task.CallFunction(function () {
            //var p = jam.Piece.createRandom();
            //if (p != jam.Piece.PRESETS[0]) {
            //    for (var ii = 0, n = hydra.math.randomInt(0, 4); ii < n; ++ii) {
            //        p = p.rotate();
            //    }
            //}
            //var fallingPiece = new jam.PieceSprite(p);
            //fallingPiece.setXY(hydra.math.randomInt(0, 320), 450);
            //var z = hydra.math.random()*4+1;
            //fallingPiece.setScale(2/z);
            //fallingPiece.addTask(new hydra.task.Sequence([
            //    hydra.task.MoveBy.linear(0, -480, z),
            //    new hydra.task.SelfDestruct()
            //]));
            //attract.addSprite(fallingPiece);
        }),
        new hydra.task.Delay(0.1)
    ])));

    var play = new hydra.Button(ui.querySelector(".button-play"));
    play.onTap = function () {
        var current = hydra.director.getCurrentScene();
        var next = new jam.PlayingScene();
        next.getRoot().setX(320);

        hydra.director.pushScene(new hydra.SlideTransition(new jam.PlayingScene(), 1));
    };
    play.activate(this); // HACK
}

//jam.MainMenuScene.prototype.createScoreSprite = function () {
//    var scores;
//    if ("scores" in jam.ctx.account) {
//        var now = Date.now();
//        scores = jam.ctx.account["scores"].map(function (x) {
//            return {
//                score: x["score"],
//                date: hydra.string.fromDate(x["date"], now)
//            }
//        });
//    } else {
//        scores = [];
//    }
//    var scoreSprite = new hydra.Group(hydra.dom.renderDiv(
//        jam.soy.scoreMenu({scores: scores})));
//    this.addEntity(scoreSprite);
//    var height = scoreSprite.element.firstElementChild.offsetHeight;

//    var back = new hydra.Button(scoreSprite.element.querySelector(".button-back"));
//    back.onTap = function () {
//        scoreSprite.addTask(new hydra.task.Sequence([
//            hydra.task.MoveTo.easeOut(0, -height, jam.MainMenuScene.SLIDE_TIME),
//            new hydra.task.CallFunction(function (dt, e) {
//                var scene = scoreSprite.getScene();
//                scoreSprite.destroy();
//                scene.createMainSprite(true);
//            })
//        ]));
//    };
//    back.activate(this); // HACK

//    scoreSprite.setY(-height);
//    scoreSprite.addTask(hydra.task.MoveTo.easeOut(0, 0, jam.MainMenuScene.SLIDE_TIME));
//}

//jam.MainMenuScene.createTransition = function () {
//    var current = hydra.director.getCurrentScene();
//    var next = new jam.MainMenuScene(true);
//    next.getRoot().setY(-416);

//    var transition = new hydra.Transition(next);
//    transition.addTask(new hydra.task.Sequence([
//        new hydra.task.Parallel([
//            hydra.task.MoveTo.linear(0, 416, jam.MainMenuScene.TRANSITION_TIME, current.getRoot()),
//            hydra.task.AnimateCss.linear("opacity", "0.2", jam.MainMenuScene.TRANSITION_TIME/2, current.getRoot()),
//            hydra.task.MoveTo.linear(0, 0, jam.MainMenuScene.TRANSITION_TIME, next.getRoot())
//        ]),
//        new hydra.task.CallFunction(function () {
//            transition.complete();
//        })
//    ]));
//    return transition;
//}
