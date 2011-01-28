goog.provide("chain.PlayingScene");
goog.provide("chain.MainMenuScene");
goog.provide("chain.OrientationScene");

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

/**
 * @type {number}
 */
chain.lives;

/**
 * @type {HTMLAudioElement}
 */
chain.music;

chain.resetGame = function () {
    chain.level = 1;
    chain.score = 0;
    chain.startRound();
    chain.music = hydra.sound.play("static/music.mp3");
    // HTMLAudioElement.prototype.loop does not work on iOS
    chain.music.addEventListener("ended", HTMLAudioElement.prototype.play, false);
}

chain.startRound = function () {
    chain.lives = 2;
}

chain.endGame = function () {
    chain.music.pause();
    chain.music = null;
}

chain.getMinimumBots = function (level) {
    return hydra.math.min(chain.getTotalBots(level), level);
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

    var muteButton = Button.div("mute-button");
    muteButton.onTap = function () {
        var oldValue = muteButton.isToggled();
        if (oldValue) {
            chain.music.play();
        } else {
            chain.music.pause();
        }
        hydra.account["mute"] = !oldValue;
        hydra.storage.saveAccount();
        muteButton.setToggled(!oldValue);
    }
    muteButton.setToggled(hydra.account["mute"]);
    this.uiLayer.addSprite(muteButton);

    if (!muteButton.isToggled()) {
        chain.music.play();
    } else {
        chain.music.pause();
    }
}

chain.PlayingScene.prototype.onTouchStart = function (event) {
    if (!this.tapped) {
        this.tapped = true;
        var touch = event.touches[0];
        // Assumes the stage isn't nested deep in another elements
        var x = touch.pageX - hydra.director.getStage().offsetLeft;
        var y = touch.pageY - hydra.director.getStage().offsetTop;
        this.createExplosion(x, y);
    }
}

chain.PlayingScene.prototype.createExplosion = function (x, y) {
    var fireball = new chain.Fireball();
    fireball.setXY(x, y);
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
chain.Fireball = function () {
    goog.base(this, hydra.dom.div("fireball"));
    var frame = 0;
    var self = this;
    this.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        new hydra.task.Delay(0.05),
        new hydra.task.CallFunction(function () {
            if (frame == 13) {
                self.destroy();
            } else {
                var x = frame % 7;
                var y = hydra.math.toInt(frame / 7);
                self.element.style.setProperty("background-position",
                    (-80*x) + "px " + (-81*y) + "px");
                ++frame;
            }
        })
    ])));
}
goog.inherits(chain.Fireball, Sprite);

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
        (chain.lives > 0 ?
            "Stage failed...<br>" + chain.lives + " tries left" :
            "Game over<br>Final score:" + chain.score);
    menu.addSprite(summary);

    if (this.isWin || chain.lives > 0) {
        var nextButton = Button.div("action-button");
        nextButton.element.textContent = this.isWin ? "Continue" : "Retry";
        nextButton.onTap = function () {
            hydra.director.pushScene(new hydra.FadeTransition(new chain.PlayingScene(), 0.5));
        };
        menu.addSprite(nextButton);
    }

    var quitButton = Button.div("action-button");
    quitButton.element.textContent = "End Game";
    quitButton.onTap = function () {
        chain.endGame();
        hydra.api.admob.showAd(chain.adBanner);
        hydra.director.pushScene(new hydra.SlideTransition(new chain.MainMenuScene(), 0.8));
    };
    menu.addSprite(quitButton);

    if (this.isWin) {
        ++chain.level;
        chain.startRound();
    } else {
        --chain.lives;
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
    var explosionLayer = new Group();
    this.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        new hydra.task.Delay(0.2),
        new hydra.task.CallFunction(function () {
            var fireball = new chain.Fireball();
            fireball.setXY(hydra.math.random() * 320,
                hydra.math.random() * 416);
            explosionLayer.addSprite(fireball);
        })
    ])));
    this.addEntity(explosionLayer);

    var logo = Sprite.div("logo");
    this.addEntity(logo);

    logo.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        new hydra.task.Delay(2),
        new hydra.task.Shake(4, 1)
    ])));

    var menu = Group.div("main menu");
    this.addEntity(menu);

    var score = hydra.account["bestScore"];
    var info = Sprite.div("info");
    info.element.textContent = score ?
        "High score: " + score :
        "Tap once to create a chain reaction!";
    menu.addSprite(info);

    var playButton = Button.div("action-button");
    playButton.element.textContent = "Play";
    playButton.onTap = function () {
        chain.resetGame();
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

    var credit = Sprite.div("credit");
    credit.element.textContent = "by @b_garcia";
    this.addEntity(credit);
}

/**
 * @constructor
 * @extends {Scene}
 */
chain.OrientationScene = function () {
    goog.base(this, "orientation");
}
goog.inherits(chain.OrientationScene, Scene);

chain.OrientationScene.shouldWarn = function () {
    // Not actually correct, but the easiest thing to get working with Safari's fucking sliding toolbar
    return document.body.offsetWidth > 320 && document.body.offsetHeight < 416;
}

chain.OrientationScene.prototype.load = function () {
    this.addEntity(new Sprite(hydra.dom.renderDiv("Rotate your device to play!")));
    this.registerListener(window, "orientationchange", function () {
        if (!chain.OrientationScene.shouldWarn()) {
            hydra.director.popScene();
        }
    });
}

});
