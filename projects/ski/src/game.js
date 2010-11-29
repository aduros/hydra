goog.provide("ski.PlayingScene");

goog.require("hydra.task.Flicker");

goog.scope(function () {
var Scene = hydra.Scene;
var Sprite = hydra.Sprite;
var Group = hydra.Group;
var Button = hydra.Button;

/**
 * @const
 */
ski.PLAYER_RADIUS = 10;

/**
 * @const
 */
ski.PLAYER_Y = 80;

/**
 * @const
 */
ski.HAZARD_RADIUS = 20;

/**
 * @enum {number}
 */
ski.PlayerState = {
    NORMAL: 0,
    STUNNED: 1,
    JUMPING: 2,
    DEAD: 3
};
var PlayerState = ski.PlayerState;

ski.TRAIL_RADIUS = 4;

ski.MAX_LIFE = 3;

/**
 * @constructor
 * @extends {Scene}
 */
ski.PlayingScene = function () {
    goog.base(this, "playing");

    /**
     * @type {Array.<Sprite>}
     */
    this.hazards = [];

    var self = this;
    // Can't rely on the simulator on this case since we want mouse hovering to be
    // like a touchmove, not a mouse drag
    if (hydra.simulator.supportsTouch) {
        this.registerListener(document.body, "touchmove", function (event) {
            var touch = event.touches[0];
            self.movePlayer(touch.clientX);
        });
    } else {
        this.registerListener(document.body, "mousemove", function (event) {
            self.movePlayer(event.clientX);
        });
    }

    this.playerState = PlayerState.NORMAL;

    this.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        new hydra.task.CallFunction(function () {
            var hazard;
            var r = hydra.math.random();
            if (r < 0.02) {
                hazard = new ski.Candy();
            } else if (r < 0.02+0.1) {
                hazard = new ski.Ramp();
            } else if (r < 0.02+0.1+0.1) {
                hazard = new ski.Flag(this.left);
                this.left = !this.left;
            } else {
                hazard = new ski.Tree();
            }
            self.addHazard(hazard);
        }),
        new hydra.task.Delay(0.2)
    ])));

    this.lifeMeter = Sprite.div("life");
    this.setLife(ski.MAX_LIFE);
    this.addEntity(this.lifeMeter);

    this.speedMeter = Sprite.div("speed");
    this.addEntity(this.speedMeter);

    this.scoreMeter = Sprite.div("score");
    this.setScore(0);
    this.addEntity(this.scoreMeter);

    var pauseButton = Button.div("pause-button");
    pauseButton.onTap = function () {
        var pauseText = Sprite.div("paused");
        pauseText.element.textContent = "PAUSED";
        pauseText.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
            new hydra.task.Delay(0.8),
            new hydra.task.SetCss("visibility", "hidden"),
            new hydra.task.Delay(0.4),
            new hydra.task.SetCss("visibility", "")
        ])));
        var pauseScene = new Scene("pause");
        pauseScene.addEntity(pauseText);
        pauseScene.registerListener(window, "touchstart", function () {
            hydra.director.popScene();
        });
        hydra.director.pushScene(pauseScene);
    }
    this.addEntity(pauseButton);

    this.setLevel(1);

    this.elapsed = 0;
    this.slalomLeft = true;

    var canvas = document.createElement("canvas");
    this.snowCtx = canvas.getContext("2d");
    canvas.height = ski.PLAYER_Y + ski.TRAIL_RADIUS;
    this.addEntity(new Sprite(canvas));

    this.registerListener(window, "resize", function () {
        self.onResize();
    });
    this.onResize();

    /**
     * @type {Sprite}
     */
    this.player = Sprite.div("player");

    this.playerChassis = new Group();
    this.playerChassis.addSprite(this.player);
    this.playerChassis.setXY(window.innerWidth/2, ski.PLAYER_Y);
    this.lastX = this.playerChassis.getX();
    this.addEntity(this.playerChassis);

    this.addHazard(new ski.Sign("DANGER"));

    this.addEntity(new hydra.Music("static/music.mp3"));
}
goog.inherits(ski.PlayingScene, Scene);

///**
// * @override
// */
//ski.PlayingScene.prototype.load = function () {
//    //var sprite = new Sprite(hydra.dom.div("sprite"));
//    //sprite.setXY(50, 50);
//    //this.addEntity(sprite);
//}

ski.PlayingScene.prototype.setFrame = function (frame) {
    this.player.element.style.backgroundPosition = (frame*-48) + "px 0";
}

ski.PlayingScene.prototype.movePlayer = function (x) {
    if (this.isCurrentScene() && this.playerState != PlayerState.DEAD) {
        this.playerChassis.setX(x);
    }
}

ski.PlayingScene.prototype.onResize = function () {
    this.snowCtx.canvas.width = window.innerWidth;
    this.snowCtx.globalCompositeOperation = "copy";
    this.snowCtx.lineWidth = 2*ski.TRAIL_RADIUS;
}

/**
 * @override
 */
ski.PlayingScene.prototype.update = function (dt) {
    goog.base(this, "update", dt);

    if (this.playerState == PlayerState.DEAD) {
        return;
    }

    this.elapsed += dt;
    if (this.elapsed > 10000) {
        this.elapsed -= 10000;
        var sign = new ski.Sign("Level " + this.level);
        var self = this;
        sign.onPass = function () {
            self.setLevel(self.level+1);
        }
        this.addHazard(sign);
    }

    var scroll = dt * window.innerHeight / (1000*this.delay);
    //var scroll = 0.25*dt;
    this.snowCtx.drawImage(this.snowCtx.canvas, 0, -scroll);
    //this.snowCtx.drawImage(this.snowCtx.canvas, 0, scroll, 320, ski.PLAYER_Y+ski.TRAIL_RADIUS-scroll,
        //0, -12, 320, ski.PLAYER_Y+ski.TRAIL_RADIUS-scroll+20);
    this.snowCtx.clearRect(0, ski.PLAYER_Y+ski.TRAIL_RADIUS-scroll, this.snowCtx.canvas.width, scroll);

    //this.setScore(hydra.math.toInt(this.score + scroll));

    if (this.playerState != PlayerState.JUMPING) {
        this.snowCtx.beginPath();
        this.snowCtx.strokeStyle = "#909090";
        this.snowCtx.lineCap = "butt";
        this.snowCtx.moveTo(this.lastX, ski.PLAYER_Y-scroll);
        this.snowCtx.lineTo(this.playerChassis.getX(), ski.PLAYER_Y);
        this.snowCtx.stroke();

        this.snowCtx.beginPath();
        this.snowCtx.strokeStyle = "#e0e0e0";
        this.snowCtx.lineCap = "round";
        this.snowCtx.moveTo(this.lastX+2, ski.PLAYER_Y-scroll);
        this.snowCtx.lineTo(this.playerChassis.getX()+2, ski.PLAYER_Y);
        this.snowCtx.stroke();
    }

    if (this.playerState == PlayerState.NORMAL) {
        var dx = this.playerChassis.getX() - this.lastX;

        if (dx > 0) {
            this.playerChassis.setScaleX(1);
        } else if (dx < 0) {
            this.playerChassis.setScaleX(-1);
        }

        this.setFrame((dx > 5 || dx < -5) ? 1 : 0);
    }

    this.lastX = this.playerChassis.getX();

    for (var ii = 0; ii < this.hazards.length; ++ii) {
        var hazard = this.hazards[ii];

        if (hazard.isActive()) {
            if (this.playerState == PlayerState.NORMAL &&
                hydra.math.abs(hazard.getX()-this.playerChassis.getX()) < ski.PLAYER_RADIUS + ski.HAZARD_RADIUS &&
                hydra.math.abs(hazard.getY()-this.playerChassis.getY()) < ski.PLAYER_RADIUS + ski.HAZARD_RADIUS) {
                hazard.onHit(this);

            } else if (hazard.getY() <= ski.PLAYER_Y) {
                hazard.onPass(this);
                this.hazards.splice(ii--, 1);
            }
        } else {
            this.hazards.splice(ii--, 1);
        }
    }
}

ski.PlayingScene.prototype.damagePlayer = function () {
    if (this.playerState != PlayerState.STUNNED) {
        this.playerState = PlayerState.STUNNED;
        this.setFrame(3);
        var self = this;
        this.player.addTask(new hydra.task.Sequence([
            new hydra.task.Parallel([
                new hydra.task.Flicker(1),
                new hydra.task.Sequence([
                    hydra.task.MoveTo.easeOut(0, -20, 0.2),
                    hydra.task.MoveTo.easeIn(0, 0, 0.2)
                ])
            ]),
            new hydra.task.CallFunction(function () {
                self.playerState = PlayerState.NORMAL;
            })
        ]));
    }
    this.setLife(this.life-1);
}

ski.PlayingScene.prototype.setLife = function (life) {
    if (life == 0) {
        // Somewhat kludgily stop all tasks
        for (var ii = 0; ii < this.root.getChildCount(); ++ii) {
            this.root.getChildAt(ii).removeAllTasks();
        }
        this.player.removeAllTasks();
        this.removeAllTasks();

        this.playerChassis.addTask(new hydra.task.Sequence([
            hydra.task.MoveTo.easeOut(this.playerChassis.getX(), 0.5*window.innerHeight, 0.5*this.delay),
            new hydra.task.CallFunction(function () {
                var gameOverScene = new hydra.Scene("gameover");
                gameOverScene.registerListener(window, "click", function () {
                    hydra.director.unwindToScene(new ski.PlayingScene());
                });
                hydra.director.pushScene(gameOverScene);
            })
        ]));
        this.player.addTask(hydra.task.RotateTo.easeOut(360*3 + 45, 0.5*this.delay));

        this.setSpeed(0);
        //this.setFrame(3);
        this.playerState = PlayerState.DEAD;
    }
    this.life = life;
    this.lifeMeter.element.style.width = (life*16)+"px";
}

ski.PlayingScene.prototype.setScore = function (score) {
    this.score = score;
    this.scoreMeter.element.textContent = "Score: " + score;
}

ski.PlayingScene.prototype.jumpPlayer = function () {
    if (this.playerState != PlayerState.JUMPING) {
        this.playerState = PlayerState.JUMPING;
        this.setFrame(4);
        this.playerChassis.element.style.zIndex = "1001";
        var self = this;
        this.player.addTask(new hydra.task.Sequence([
            hydra.math.random() < 0.5 ?
                hydra.task.ScaleTo.easeIn(-2, 2, 0.5) : hydra.task.ScaleTo.easeIn(2, -2, 0.5),
            hydra.task.ScaleTo.easeOut(1, 1, 0.5),
            new hydra.task.CallFunction(function () {
                self.playerState = PlayerState.NORMAL;
                self.playerChassis.element.style.zIndex = "";
            })
        ]));
    }
}

/**
 * @param {Sprite} hazard
 */
ski.PlayingScene.prototype.addHazard = function (hazard) {
    hazard.addTask(new hydra.task.Sequence([
        hydra.task.MoveTo.linear(hazard.getX(), -32, this.delay),
        new hydra.task.SelfDestruct()
    ]));

    this.hazards.push(hazard);
    this.addEntity(hazard);
}

ski.PlayingScene.prototype.setLevel = function (level) {
    this.level = level;
    this.setSpeed(Math.sqrt(level)); // TODO: Use sine curve
}

ski.PlayingScene.prototype.setSpeed = function (speed) {
    this.speedMeter.element.textContent = speed + " km/h";
    this.delay = 3 / speed;
}

/**
 * @interface
 */
ski.Hazard = function () { }

/**
 * @param {ski.PlayingScene} scene
 */
ski.Hazard.prototype.onHit = function (scene) { }

/**
 * @param {ski.PlayingScene} scene
 */
ski.Hazard.prototype.onPass = function (scene) { }

/**
 * @constructor
 * @extends {Sprite}
 * @implements {ski.Hazard}
 */
ski.Tree = function () {
    goog.base(this, hydra.dom.div("tree"));
    this.setXY(hydra.math.random()*window.innerWidth, window.innerHeight+32);
}
goog.inherits(ski.Tree, Sprite);

ski.Tree.prototype.onHit = function (scene) {
    scene.damagePlayer();
}

ski.Tree.prototype.onPass = function (scene) {
}

/**
 * @constructor
 * @extends {Sprite}
 * @implements {ski.Hazard}
 */
ski.Ramp = function () {
    goog.base(this, hydra.dom.div("ramp"));
    this.setXY(hydra.math.random()*window.innerWidth, window.innerHeight+32);
}
goog.inherits(ski.Ramp, Sprite);

ski.Ramp.prototype.onHit = function (scene) {
    scene.jumpPlayer();
    scene.setScore(scene.score + 100);
}

ski.Ramp.prototype.onPass = function (scene) {
}

/**
 * @constructor
 * @param {boolean} left
 * @extends {Sprite}
 * @implements {ski.Hazard}
 */
ski.Flag = function (left) {
    goog.base(this, hydra.dom.div(left ? "flag-left" : "flag-right"));
    this.left = left;
    var w = window.innerWidth;
    this.setXY(0.4*hydra.math.random()*w + (left ? 0.1*w : 0.5*w), window.innerHeight+32);
}
goog.inherits(ski.Flag, Sprite);

ski.Flag.prototype.onHit = function (scene) {
    //scene.damagePlayer();
}

ski.Flag.prototype.onPass = function (scene) {
    if (scene.playerChassis.getX() < this.getX() == this.left) {
        this.element.style.backgroundColor = "lime";
        scene.setScore(scene.score + 200);
    } else {
        this.element.style.backgroundColor = "yellow";
    }
}

/**
 * @constructor
 * @param {string} text
 * @extends {Sprite}
 * @implements {ski.Hazard}
 */
ski.Sign = function (text) {
    goog.base(this, hydra.dom.div("sign"));
    this.element.textContent = text;
    this.setXY(hydra.math.random()*window.innerWidth, window.innerHeight+32);
}
goog.inherits(ski.Sign, Sprite);

ski.Sign.prototype.onPass = function () {
}

ski.Sign.prototype.onHit = function () {
}

/**
 * @constructor
 * @extends {Group}
 * @implements {ski.Hazard}
 */
ski.Candy = function () {
    goog.base(this);
    this.contents = Sprite.div("candy");
    this.addSprite(this.contents);
    this.setXY(hydra.math.random()*window.innerWidth, window.innerHeight+32);
}
goog.inherits(ski.Candy, Group);

ski.Candy.prototype.onPass = function () {
}

ski.Candy.prototype.onHit = function (scene) {
    if (this.contents) {
        this.removeAllTasks();
        this.addTask(new hydra.task.Sequence([
            hydra.task.MoveTo.linear(0, 0, 1),
            new hydra.task.SelfDestruct()
        ]));
        this.contents.addTask(hydra.task.RotateTo.linear(3*360, 1));
        this.contents = null;

        var life = scene.life+1;
        if (life <= ski.MAX_LIFE) {
            scene.lifeMeter.addTask(new hydra.task.Sequence([
                hydra.task.ScaleTo.linear(1.2, 1.2, 0.2),
                hydra.task.ScaleTo.linear(1, 1, 0.2)
            ]));
            scene.setLife(life);
        }
        scene.setScore(scene.score + 500);
    }
}

});
