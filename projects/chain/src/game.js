goog.provide("chain.PlayingScene");
goog.provide("chain.MainMenuScene");

goog.require("hydra.task.Shake");
goog.require("hydra.FadeTransition");
goog.require("hydra.SlideTransition");

goog.scope(function () {
var Scene = hydra.Scene;
var Sprite = hydra.Sprite;
var Group = hydra.Group;
var Button = hydra.Button;

/**
 * @const
 */
chain.BOMB_RADIUS = 48;

/**
 * @const
 */
chain.ROBOT_RADIUS = 12;

/**
 * @const
 */
chain.ROBOT_SPEED = 50; // px/s

/**
 * @const
 */
chain.SCORE_PER_ROBOT = 25;

/**
 * @type {number}
 */
chain.level;

/**
 * @type {number}
 */
chain.score;

chain.resetGame = function () {
    chain.level = 1;
    chain.score = 0;
}

chain.getMinimumBots = function (level) {
    return level;
}

chain.getTotalBots = function (level) {
    return Math.round(5 * Math.pow(level, 0.5));
}

chain.getLevelBonus = function (level) {
    return level * chain.SCORE_PER_ROBOT * 3;
}

/**
 * @constructor
 * @extends {Scene}
 */
chain.PlayingScene = function () {
    goog.base(this, "playing");

    /**
     * @type {Array.<chain.Robot>}
     */
    this.robots = [];

    /**
     * @type {Array.<Sprite>}
     */
    this.shockwaves = [];

    this.minimumBots = chain.getMinimumBots(chain.level);
    this.totalBots = chain.getTotalBots(chain.level);
}
goog.inherits(chain.PlayingScene, Scene);

/**
 * @override
 */
chain.PlayingScene.prototype.load = function () {
    var theme = hydra.math.toInt(chain.level/3) % 3;
    this.root.element.style.backgroundImage = "url(static/terrain" + theme + ".png)";

    this.addEntity(this.groundLayer = new Group());
    this.addEntity(this.actorLayer = new Group());
    this.addEntity(this.uiLayer = new Group());

    for (var ii = 0; ii < this.totalBots; ++ii) {
        var robot = new chain.Robot();
        var angle = hydra.math.random() * 2*hydra.math.PI;
        robot.setXY(hydra.math.random()*320, hydra.math.random()*416);
        robot.vx = chain.ROBOT_SPEED*Math.cos(angle);
        robot.vy = chain.ROBOT_SPEED*Math.sin(angle);

        this.actorLayer.addSprite(robot);
        this.robots.push(robot);
    }

    this.elapsed = 0;
    this.killedBots = 0;
    this.tapped = false;

    this.uiLayer.addSprite(this.score = Sprite.div("score"));
    this.uiLayer.addSprite(this.status = Sprite.div("status"));
    this.updateStatus();

    this.registerListener(this.root.element, "touchstart",
        goog.bind(chain.PlayingScene.prototype.onTouchStart, this));

    var marquee = new Sprite.div("marquee");
    marquee.element.textContent = "Stage " + chain.level;
    marquee.setY(150);
    marquee.addTask(new hydra.task.Sequence([
        hydra.task.StyleTo.linear("opacity", "0", 3)
        //new hydra.task.SelfDestruct()
    ]));
    this.uiLayer.addSprite(marquee);
}

chain.PlayingScene.prototype.onTouchStart = function (event) {
    if (!this.tapped) {
        this.tapped = true;
        var touch = event.touches[0];
        var local = this.root.pageToLocal(touch.pageX, touch.pageY); // FIXME
        this.createExplosion(local.x, local.y);
    }
}

chain.PlayingScene.prototype.createExplosion = function (x, y) {
    var frame = 0;
    var fireball = Sprite.div("fireball");
    fireball.setXY(x, y);
    fireball.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        new hydra.task.Delay(0.05),
        new hydra.task.CallFunction(function () {
            if (frame == 13) {
                fireball.destroy();
            } else {
                var x = frame % 7;
                var y = hydra.math.toInt(frame / 7);
                fireball.element.style.setProperty("background-position",
                    (-80*x) + "px " + (-80*y) + "px");
                ++frame;
            }
        })
    ])));
    this.actorLayer.addSprite(fireball);

    var shockwave = Sprite.div("shockwave");
    shockwave.setXY(x, y);
    shockwave.setScale(0);
    shockwave.addTask(new hydra.task.Sequence([
        hydra.task.ScaleTo.linear(1, 1, 0.5),
        new hydra.task.Delay(0.5),
        hydra.task.StyleTo.linear("opacity", "0", 0.25),
        //hydra.task.ScaleTo.linear(0, 0, 0.25),
        new hydra.task.SelfDestruct()
    ]));
    this.actorLayer.addSprite(shockwave);
    this.shockwaves.push(shockwave);

    var crater = Sprite.div("crater");
    crater.setXY(x, y);
    this.groundLayer.addSprite(crater);
}

chain.PlayingScene.prototype.updateStatus = function () {
    this.status.element.textContent =
        this.killedBots + " / " + this.minimumBots + " of " + this.totalBots;
    this.score.element.textContent = String(this.getScore());

    if (this.killedBots == this.minimumBots) {
        hydra.dom.addClass(this.status.element, "win");
        this.status.addTask(new hydra.task.Sequence([
            hydra.task.ScaleTo.easeIn(1.2, 1.2, 0.25),
            hydra.task.ScaleTo.easeOut(1, 1, 0.25)
        ]));
    }
}

chain.PlayingScene.prototype.getScore = function () {
    return chain.score + this.killedBots * 25;
}

/**
 * @override
 */
chain.PlayingScene.prototype.update = function (dt) {
    goog.base(this, "update", dt);

    var frame = hydra.math.toInt(this.elapsed / 200) % 4;
    if (frame == 3) {
        frame = 1;
    }
    var shouldUpdateFrame = false;
    if (this.lastFrame != frame) {
        this.lastFrame = frame;
        shouldUpdateFrame = true;
    }
    this.elapsed += dt;

    robotLoop: for (var ii = 0; ii < this.robots.length; ++ii) {
        var robot = this.robots[ii];

        shockwaveLoop: for (var jj = 0; jj < this.shockwaves.length; ++jj) {
            var shockwave = this.shockwaves[jj];
            if (shockwave.isActive()) {
                var dx = robot.getX() - shockwave.getX();
                var dy = robot.getY() - shockwave.getY();
                var sqd = dx*dx + dy*dy;
                var threshold = shockwave.getScaleX() * chain.BOMB_RADIUS + chain.ROBOT_RADIUS;
                threshold *= threshold;

                if (sqd < threshold) {
                    robot.destroy();
                    this.robots.splice(ii--, 1);
                    this.createExplosion(robot.getX(), robot.getY());

                    ++this.killedBots;
                    this.updateStatus();

                    continue robotLoop;
                }
            } else {
                this.shockwaves.splice(jj--, 1);
            }
        }

        var x = robot.getX() + 0.001*dt*robot.vx;
        var y = robot.getY() + 0.001*dt*robot.vy;
        if (robot.getX() < chain.ROBOT_RADIUS) {
            x = chain.ROBOT_RADIUS;
            robot.vx = -robot.vx;
        }
        if (robot.getX() > 320-chain.ROBOT_RADIUS) {
            x = 320-chain.ROBOT_RADIUS;
            robot.vx = -robot.vx;
        }
        if (robot.getY() < chain.ROBOT_RADIUS) {
            y = chain.ROBOT_RADIUS;
            robot.vy = -robot.vy;
        }
        if (robot.getY() > 416-chain.ROBOT_RADIUS) {
            y = 416-chain.ROBOT_RADIUS;
            robot.vy = -robot.vy;
        }
        robot.setXY(x, y);
        if (shouldUpdateFrame) {
            robot.setFrame(frame);
        }
    }

    if (this.tapped && (this.robots.length == 0 || this.shockwaves.length == 0)) {
        var win = this.killedBots >= this.minimumBots;
        if (win) {
            chain.score = this.getScore() + chain.getLevelBonus(chain.level);
        }
        hydra.account["bestScore"] =
            hydra.math.max(hydra.math.toInt(hydra.account["bestScore"]), chain.score);
        hydra.storage.saveAccount();
        hydra.director.pushScene(new hydra.FadeTransition(new chain.ContinueScene(win), 0.5));
    }
}

/**
 * @constructor
 * @extends {Sprite}
 */
chain.Robot = function () {
    goog.base(this, hydra.dom.div("robot"));
    this.vx = 0;
    this.vy = 0;
}
goog.inherits(chain.Robot, Sprite);

chain.Robot.prototype.setFrame = function (frame) {
    var row;
    if (this.vx < this.vy) {
        if (this.vx < -this.vy) {
            row = 3; // W
        } else {
            row = 2; // S
        }
    } else {
        if (this.vx < -this.vy) {
            row = 0; // N
        } else {
            row = 1; // E
        }
    }
    this.element.style.setProperty("background-position",
        (-24*frame) + "px " + (-32*row) + "px");
}

/**
 * @constructor
 * @extends {Scene}
 * @param {boolean} isWin
 */
chain.ContinueScene = function (isWin) {
    goog.base(this, "continue");
    this.isWin = isWin;
}
goog.inherits(chain.ContinueScene, Scene);

/**
 * @override
 */
chain.ContinueScene.prototype.load = function () {
    var menu = Group.div("continue menu");
    this.addEntity(menu);

    var summary = Sprite.div("summary " + (this.isWin ? "win" : "loss"));
    summary.element.innerHTML = this.isWin ?
        "Stage " + chain.level + " complete!<br>" +
            chain.score + " pts (" + chain.getLevelBonus(chain.level) + " bonus)" :
        "Stage failed...";
    menu.addSprite(summary);

    var nextButton = Button.div("action-button");
    nextButton.element.textContent = this.isWin ? "Continue" : "Retry";
    nextButton.onTap = function () {
        hydra.director.pushScene(new hydra.FadeTransition(new chain.PlayingScene(), 0.5));
    };
    menu.addSprite(nextButton);

    var quitButton = Button.div("action-button");
    quitButton.element.textContent = "End Game";
    quitButton.onTap = function () {
        hydra.director.pushScene(new hydra.SlideTransition(new chain.MainMenuScene(), 0.8));
    };
    menu.addSprite(quitButton);

    if (this.isWin) {
        ++chain.level;
    }
}

/**
 * @constructor
 * @extends {Scene}
 */
chain.MainMenuScene = function () {
    goog.base(this, "mainmenu");
}
goog.inherits(chain.MainMenuScene, Scene);

chain.MainMenuScene.prototype.load = function () {
    var menu = Group.div("main menu");
    this.addEntity(menu);

    var playButton = Button.div("action-button");
    playButton.element.textContent = "Play";
    playButton.onTap = function () {
        hydra.director.pushScene(new hydra.SlideTransition(new chain.PlayingScene(), 0.8));
    };
    menu.addSprite(playButton);

    var quitButton = Button.div("action-button");
    quitButton.element.textContent = "Quit";
    quitButton.onTap = function () {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.close();
            window.location = "http://google.com"; // We'll get here if close() was refused
        }
    };
    menu.addSprite(quitButton);

    var score = hydra.account["bestScore"];
    if (score) {
        var bestScore = Sprite.div("bestScore");
        bestScore.element.textContent = "High score: " + score;
        this.addEntity(bestScore);
    }
}

});
