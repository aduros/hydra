goog.provide("ski.PlayingScene");

goog.require("hydra.task.Flicker");

goog.scope(function () {
var Scene = hydra.Scene;
var Sprite = hydra.Sprite;
var Group = hydra.Group;

/**
 * @const
 */
ski.PLAYER_RADIUS = 10;

/**
 * @const
 */
ski.PLAYER_Y = 50;

/**
 * @const
 */
ski.HAZARD_RADIUS = 10;

/**
 * @enum {number}
 */
ski.PlayerState = {
    NORMAL: 0,
    STUNNED: 1,
    JUMPING: 2
};

ski.TRAIL_RADIUS = 4;

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

    var canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = ski.PLAYER_Y + ski.TRAIL_RADIUS;
    this.addEntity(new Sprite(canvas));

    this.snowCtx = canvas.getContext("2d");
    this.snowCtx.globalCompositeOperation = "copy";
    this.snowCtx.lineWidth = 2*ski.TRAIL_RADIUS;
    //this.snowCtx.moveTo(0, 0);
    //this.snowCtx.lineTo(200, ski.PLAYER_Y);
    //this.snowCtx.stroke();

    /**
     * @type {Sprite}
     */
    this.player = new Sprite(hydra.dom.div("player"));

    this.playerChassis = new Group();
    this.playerChassis.addSprite(this.player);
    this.playerChassis.setXY(320/2, ski.PLAYER_Y);
    this.lastX = this.playerChassis.getX();
    this.addEntity(this.playerChassis);

    var self = this;
    this.registerListener(document.body, "touchmove", function (event) {
        var touch = event.touches[0];
        self.playerChassis.setX(touch.clientX);
    });

    this.playerState = ski.PlayerState.NORMAL;

    this.addTask(new hydra.task.Repeat(new hydra.task.Sequence([
        new hydra.task.CallFunction(function () {
            var hazard;
            var r = hydra.math.random();
            if (r < 0.1) {
                hazard = new ski.Ramp();
            } else if (r < 0.2) {
                hazard = new ski.Flag(this.left);
                this.left = !this.left;
            } else {
                hazard = new ski.Tree();
            }
            self.addHazard(hazard);
        }),
        new hydra.task.Delay(0.2)
    ])));

    this.lifeMeter = new Sprite(hydra.dom.div("life"));
    this.setLife(3);

    this.slalomLeft = true;
}
goog.inherits(ski.PlayingScene, Scene);

/**
 * @override
 */
ski.PlayingScene.prototype.load = function () {
    //var sprite = new Sprite(hydra.dom.div("sprite"));
    //sprite.setXY(50, 50);
    //this.addEntity(sprite);
    this.addHazard(new ski.Sign("Welcome"));
}

ski.PlayingScene.prototype.setFrame = function (frame) {
    this.player.element.style.backgroundPosition = (frame*-48) + "px 0";
}

/**
 * @override
 */
ski.PlayingScene.prototype.update = function (dt) {
    goog.base(this, "update", dt);

    var scroll = 0.25*dt;
    this.snowCtx.drawImage(this.snowCtx.canvas, 0, -scroll);
    this.snowCtx.clearRect(0, ski.PLAYER_Y+ski.TRAIL_RADIUS-scroll, 320, scroll);

    if (this.playerState != ski.PlayerState.JUMPING) {
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

    if (this.playerState == ski.PlayerState.NORMAL) {
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

        if (this.playerState == ski.PlayerState.NORMAL &&
            hydra.math.abs(hazard.getX()-this.playerChassis.getX()) < ski.PLAYER_RADIUS + ski.HAZARD_RADIUS &&
            hydra.math.abs(hazard.getY()-this.playerChassis.getY()) < ski.PLAYER_RADIUS + ski.HAZARD_RADIUS) {
            hazard.onHit(this);

        } else if (hazard.getY() <= ski.PLAYER_Y) {
            hazard.onPass(this);
            this.hazards.splice(ii--, 1);
        }
    }
}

ski.PlayingScene.prototype.damagePlayer = function () {
    if (this.playerState != ski.PlayerState.STUNNED) {
        this.playerState = ski.PlayerState.STUNNED;
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
                self.playerState = ski.PlayerState.NORMAL;
            })
        ]));
    }
    this.setLife(this.life-1);
}

ski.PlayingScene.prototype.setLife = function (life) {
    this.life = life;
    this.lifeMeter.element.style.width = (life*32)+"px";
}

ski.PlayingScene.prototype.jumpPlayer = function () {
    if (this.playerState != ski.PlayerState.JUMPING) {
        this.playerState = ski.PlayerState.JUMPING;
        this.setFrame(4);
        this.playerChassis.element.style.zIndex = "9999";
        var self = this;
        this.player.addTask(new hydra.task.Sequence([
            hydra.task.ScaleTo.easeIn(-2, 2, 0.5),
            hydra.task.ScaleTo.easeOut(1, 1, 0.5),
            new hydra.task.CallFunction(function () {
                self.playerState = ski.PlayerState.NORMAL;
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
        hydra.task.MoveTo.linear(hazard.getX(), -32, 2),
        new hydra.task.SelfDestruct()
    ]));

    this.hazards.push(hazard);
    this.addEntity(hazard);
}

/**
 * @interface
 */
ski.Hazard = function () {
}

/**
 * @param {ski.PlayingScene} scene
 */
ski.Hazard.prototype.onHit = function (scene) {
}

/**
 * @param {ski.PlayingScene} scene
 */
ski.Hazard.prototype.onPass = function (scene) {
}

/**
 * @constructor
 * @extends {Sprite}
 * @implements {ski.Hazard}
 */
ski.Tree = function () {
    goog.base(this, hydra.dom.div("tree"));
    this.setXY(hydra.math.random()*320, 416+32);
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
    this.setXY(hydra.math.random()*320, 416+32);
}
goog.inherits(ski.Ramp, Sprite);

ski.Ramp.prototype.onHit = function (scene) {
    scene.jumpPlayer();
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
    this.setXY(0.4*hydra.math.random()*320 + (left ? 0.1*320 : 0.5*320), 416+32);
}
goog.inherits(ski.Flag, Sprite);

ski.Flag.prototype.onHit = function (scene) {
    //scene.damagePlayer();
}

ski.Flag.prototype.onPass = function (scene) {
    if (scene.playerChassis.getX() < this.getX() == this.left) {
        this.element.style.backgroundColor = "lime";
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
    this.setXY(hydra.math.random()*320, 416+32);
}
goog.inherits(ski.Sign, Sprite);

ski.Sign.prototype.onPass = function () { }
ski.Sign.prototype.onHit = function () { }

});
