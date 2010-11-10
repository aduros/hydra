goog.provide("jam.BoardSprite");

goog.require("hydra.Group");
goog.require("hydra.task.StyleTo");
goog.require("hydra.task.SelfDestruct");
goog.require("hydra.task.Sequence");
goog.require("hydra.task.Parallel");

goog.require("jam.Board");

/**
 * @constructor
 * @extends {hydra.Group}
 */
jam.BoardSprite = function () {
    goog.base(this, hydra.dom.div("board"));

    this.registerListener(jam.ctx.board, jam.BoardEvent.GAME_STARTED, goog.bind(this.onGameStart, this));
    this.registerListener(jam.ctx.board, jam.BoardEvent.PATH_CLEARED, goog.bind(this.onPathCleared, this));
    this.registerListener(jam.ctx.board, jam.BoardEvent.PATH_CANCELED, goog.bind(this.onPathCanceled, this));
    this.registerListener(jam.ctx.board, jam.BoardEvent.SCORE_CHANGED, goog.bind(this.onScoreChanged, this));
    this.registerListener(this.element, "touchstart", goog.bind(this.onTouchMove, this));
    this.registerListener(this.element, "touchmove", goog.bind(this.onTouchMove, this));
    this.registerListener(this.element, "touchend", goog.bind(this.onTouchEnd, this));
    this.registerListener(this.element, "touchcancel", goog.bind(this.onTouchEnd, this));

    var canvas = new hydra.Sprite(document.createElement("canvas"));
    this.addSprite(canvas);
    canvas.element.style.zIndex = "9999";
    canvas.element.width = jam.BoardSprite.WIDTH;
    canvas.element.height = jam.BoardSprite.HEIGHT;
    this.canvasCtx = canvas.element.getContext("2d");
    this.canvasCtx.lineWidth = 6;
    this.canvasCtx.strokeStyle = "#0000ff"; //"#ffcc00";
}
goog.inherits(jam.BoardSprite, hydra.Group);

/**
 * @const
 * @type {number}
 */
jam.BoardSprite.BLOCK_SIZE = 40;

/**
 * @const
 * @type {number}
 */
jam.BoardSprite.WIDTH = jam.Board.WIDTH*jam.BoardSprite.BLOCK_SIZE;

/**
 * @const
 * @type {number}
 */
jam.BoardSprite.HEIGHT = jam.Board.HEIGHT*jam.BoardSprite.BLOCK_SIZE;

jam.BoardSprite.prototype.onGameStart = function () {
    this.blockSprites = [];
    for (var y = 0; y < jam.Board.HEIGHT; ++y) {
        for (var x = 0; x < jam.Board.WIDTH; ++x) {
            var block = jam.ctx.board.getBlockAt(x, y);
//            var sprite = new hydra.Sprite(hydra.dom.div("block" + block));
            var sprite = hydra.Sprite.div("block" + block);
            sprite.setXY(jam.BoardSprite.BLOCK_SIZE*x, jam.BoardSprite.BLOCK_SIZE*y);

            this.addSprite(sprite);
            this.blockSprites[y*jam.Board.WIDTH+x] = sprite;
        }
    }

}

jam.BoardSprite.prototype.onPathCleared = function () {
    var path = jam.ctx.board.pathList;
    var pathMask = {};
    for (var ii = 0, ll = path.length; ii < ll; ++ii) {
        var block = this.blockSprites[path[ii]];
        pathMask[path[ii]] = true;
        block.removeAllTasks();
        block.element.style.backgroundColor = ""; // Reset style
        block.addTask(new hydra.task.Sequence([
            new hydra.task.Delay((ll-ii)*0.1),
            hydra.task.ScaleTo.linear(0, 0, 0.15),
            new hydra.task.SelfDestruct()
        ]));
    }

    var fallDelay = 0.1*ll;

    for (var x = 0; x < jam.Board.WIDTH; ++x) {
        var drop = 0;
        var skullMode = true;
        for (var y = jam.Board.HEIGHT-1; y >= 0; --y) {
            var p = y*jam.Board.WIDTH+x;
            if (p in pathMask) {
                ++drop;
            } else {
                var block = jam.ctx.board.blocks[p];
                if (skullMode && block == 0) {
                    ++drop;
                } else {
                    skullMode = false;
                }
                if (drop) {
                    var sprite = this.blockSprites[p];
                    var newP = p + drop*jam.Board.WIDTH;

                    var tasks = [
                        new hydra.task.Delay(fallDelay),
                        hydra.task.MoveTo.easeIn(x*jam.BoardSprite.BLOCK_SIZE, (y+drop)*jam.BoardSprite.BLOCK_SIZE, drop*0.2)
                    ];

                    // Copy down
                    if (newP > jam.Board.WIDTH*jam.Board.HEIGHT) {
                        // Move skulls off screen
                        tasks.push(new hydra.task.SelfDestruct());
                    } else {
                        this.blockSprites[newP] = sprite;
                        jam.ctx.board.blocks[newP] = block; // Update the model in a view, yeah yeah, hack
                    }
                    sprite.removeAllTasks();
                    sprite.addTask(new hydra.task.Sequence(tasks));
                }
            }
        }
        // Generate new blocks
        for (var y = 0; y < drop; ++y) {
            var p = y*jam.Board.WIDTH+x;
            var newBlock = jam.ctx.board.randomBlock();
            jam.ctx.board.blocks[p] = newBlock;

//            var newSprite = new hydra.Sprite(hydra.dom.div("block"+newBlock));
            var newSprite = hydra.Sprite.div("block"+newBlock);
            newSprite.setXY(x*jam.BoardSprite.BLOCK_SIZE, -(drop-y)*jam.BoardSprite.BLOCK_SIZE);
            newSprite.addTask(new hydra.task.Sequence([
                new hydra.task.Delay(fallDelay),
                hydra.task.MoveTo.easeIn(x*jam.BoardSprite.BLOCK_SIZE, y*jam.BoardSprite.BLOCK_SIZE, drop*0.2)
            ]));

            this.addSprite(newSprite);
            this.blockSprites[p] = newSprite;
        }
    }

    this.clearCanvas();
}

jam.BoardSprite.prototype.clearCanvas = function () {
    this.canvasCtx.clearRect(0, 0, jam.BoardSprite.WIDTH, jam.BoardSprite.HEIGHT);
}

jam.BoardSprite.prototype.onPathCanceled = function () {
    var path = jam.ctx.board.pathList;
    for (var ii = 0; ii < path.length; ++ii) {
        var block = this.blockSprites[path[ii]];
        block.element.style.backgroundColor = ""; // Reset style
    }
    this.clearCanvas();
}

jam.BoardSprite.prototype.onTouchMove = function (event) {
    if (!this.inCurrentScene()) {
        return;
    }
    var touch = event.touches[0];
    var local = this.pageToLocal(touch.pageX, touch.pageY);
    local.x = hydra.math.clamp(local.x, 0, jam.BoardSprite.WIDTH-1);
    local.y = hydra.math.clamp(local.y, 0, jam.BoardSprite.HEIGHT-1);

    var x = hydra.math.toInt(local.x/jam.BoardSprite.BLOCK_SIZE);
    var y = hydra.math.toInt(local.y/jam.BoardSprite.BLOCK_SIZE);
    var p = y*jam.Board.WIDTH+x;

    switch (jam.ctx.board.addPoint(p)) {
        case jam.AddPointResult.ADDED:
            var block = this.blockSprites[y*jam.Board.WIDTH+x];
            block.element.style.backgroundColor = "#fff";
            // No break
        case jam.AddPointResult.ALREADY_ADDED:
            if (this.lastTouch) {
                this.canvasCtx.beginPath();
                this.canvasCtx.moveTo(this.lastTouch.x, this.lastTouch.y);
                this.canvasCtx.lineTo(local.x, local.y);
                this.canvasCtx.stroke();
            }
            this.lastTouch = local;
            break;
        case jam.AddPointResult.INVALID:
//            console.log("Invalid");
            break;
    }
}

jam.BoardSprite.prototype.onTouchEnd = function (event) {
    if (!this.inCurrentScene()) {
        return;
    }
    jam.ctx.board.submitPath();
    this.lastTouch = null;
}

jam.BoardSprite.prototype.onScoreChanged = function (delta) {
    if (delta > 0) {
        var floater = hydra.Sprite.div("floater");
        floater.element.textContent = "+" + delta;
        floater.addTask(new hydra.task.Sequence([
            hydra.task.MoveBy.linear(0, -30, 1.5),
            new hydra.task.SelfDestruct()
        ]));
        floater.addTask(new hydra.task.Sequence([
            new hydra.task.Delay(1),
            hydra.task.StyleTo.linear("opacity", "0", 0.5)
        ]));
        this.addSprite(floater);
        // clientWidth/height only available when added to the document
        var width = floater.element.clientWidth;
        floater.setXY(hydra.math.clamp(this.lastTouch.x - width/2, 0, 320 - width),
            this.lastTouch.y - floater.element.clientHeight/2);
    }
}
