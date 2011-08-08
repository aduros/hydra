//
// Fruit Link - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("jam.Board");
goog.provide("jam.AddPointResult");

goog.require("hydra.array");
goog.require("hydra.math");
goog.require("hydra.EventDispatcher");

goog.require("jam.BoardEvent");

/**
 * @enum {number}
 */
jam.AddPointResult = {
    ADDED: 0,
    ALREADY_ADDED: 1,
    INVALID: 2
};

/**
 * @constructor
 * @extends {hydra.EventDispatcher}
 */
jam.Board = function () {
    goog.base(this);
}
goog.inherits(jam.Board, hydra.EventDispatcher);

/**
 * @const
 * @type {number}
 */
jam.Board.WIDTH = 8;

/**
 * @const
 * @type {number}
 */
jam.Board.HEIGHT = 9;

/**
 * @const
 * @type {number}
 */
jam.Board.TILE_TYPES = 3;

/**
 * @const
 * @type {number}
 */
jam.Board.MAX_TIME = 2*60*1000;

jam.Board.prototype.startGame = function () {
    this.pathMap = {};
    /** @type Array.<number> */
    this.pathList = [];

    this.blocks = [];
    for (var ii = 0; ii < jam.Board.WIDTH*jam.Board.HEIGHT; ++ii) {
        this.blocks[ii] = hydra.math.randomInt(1, jam.Board.TILE_TYPES+1);
    }

    this.playing = true;
    this.score = 0;
    this.elapsed = 0;

    this.dispatchEvent(jam.BoardEvent.GAME_STARTED);
    this.dispatchEvent(jam.BoardEvent.SCORE_CHANGED);
}

jam.Board.prototype.randomBlock = function () {
    var level = hydra.math.toInt(this.score/10000);
    if (hydra.math.random() < hydra.math.min(0.3, 0.1*(level+1))) {
        return 0;
    } else {
        return hydra.math.randomInt(1, jam.Board.TILE_TYPES);
    }
}

jam.Board.prototype.submitPath = function () {
    if (this.pathList.length > 1) {
        this.dispatchEvent(jam.BoardEvent.PATH_CLEARED);

        var delta = 50*hydra.math.toInt(Math.pow(this.pathList.length, 1.6));
        this.score += delta;

        this.dispatchEvent(jam.BoardEvent.SCORE_CHANGED, delta);
    } else {
        this.dispatchEvent(jam.BoardEvent.PATH_CANCELED);
    }
    this.pathMap = {};
    this.pathList.length = 0;
}

/**
 * @param {number} p
 */
jam.Board.prototype.addPoint = function (p) {
    if (p in this.pathMap) {
        return jam.AddPointResult.ALREADY_ADDED;
    } else {
        var result = jam.AddPointResult.INVALID;
        if (this.pathList.length) {
            var lastP = this.pathList[this.pathList.length-1];
            if (p == lastP+1 || p == lastP-1 || p == lastP+jam.Board.WIDTH || p == lastP-jam.Board.WIDTH) {
                if (this.blocks[lastP] == this.blocks[p]) {
                    result = jam.AddPointResult.ADDED;
                }
            }
        } else if (this.blocks[p] != 0) {
            result = jam.AddPointResult.ADDED;
        }

        if (result == jam.AddPointResult.ADDED) {
            this.pathMap[p] = true;
            hydra.array.push(this.pathList, p);
        }
        return result;
    }
}

jam.Board.prototype.getBlockAt = function (x, y) {
    return this.blocks[y*jam.Board.WIDTH+x];
}

jam.Board.prototype.endGame = function () {
    this.playing = false;
    this.dispatchEvent(jam.BoardEvent.GAME_OVER);
}
