//
// Block Dream - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("tetris.BoardSprite");

goog.require("hydra.Group");
goog.require("hydra.task.StyleTo");
goog.require("hydra.task.SelfDestruct");
goog.require("hydra.task.Sequence");
goog.require("hydra.task.Parallel");

goog.require("tetris.Board");
goog.require("tetris.ctx");
goog.require("tetris.util");

/**
 * @constructor
 * @extends {hydra.Group}
 */
tetris.BoardSprite = function () {
    goog.base(this);

    this.blocks = [];
    this.activePieceChassis = new hydra.Group();
    this.addSprite(this.activePieceChassis);

    this.registerListener(tetris.ctx.board, tetris.BoardEvent.PIECE_MOVED, goog.bind(this.onPieceMoved, this));
    this.registerListener(tetris.ctx.board, tetris.BoardEvent.PIECE_DROPPED, goog.bind(this.onPieceDropped, this));
    this.registerListener(tetris.ctx.board, tetris.BoardEvent.NEXT_PIECE, goog.bind(this.onNextPiece, this));
    this.registerListener(tetris.ctx.board, tetris.BoardEvent.ROWS_CLEARED, goog.bind(this.onRowsCleared, this));
    this.registerListener(tetris.ctx.board, tetris.BoardEvent.PIECE_ROTATED, goog.bind(this.onPieceRotated, this));
    this.registerListener(tetris.ctx.board, tetris.BoardEvent.PIECE_PLACED, goog.bind(this.onPiecePlaced, this));
}
goog.inherits(tetris.BoardSprite, hydra.Group);

tetris.BoardSprite.BLOCK_SIZE = 20;

tetris.BoardSprite.prototype.onPieceMoved = function (p, dx, dy) {
    this.activePieceChassis.setXY(
        tetris.BoardSprite.BLOCK_SIZE * p.x,
        tetris.BoardSprite.BLOCK_SIZE * p.y);
}

tetris.BoardSprite.prototype.onPieceDropped = function (p) {
    // Reparent outside of chassis
    this.addSprite(this.activePiece);
    this.element.insertBefore(this.activePiece.element, this.element.childNodes[0]);
    this.activePiece.setXY(this.activePieceChassis.getX(), this.activePieceChassis.getY());
    this.activePiece.setScaleY(10);
    this.activePiece.element.style.opacity = "0.2";

    // TODO: hydra.task.Parallel
//    this.activePiece.addTask(hydra.task.StyleTo.linear("opacity", "0.1", 0.6));
    this.activePiece.addTask(hydra.task.MoveBy.linear(0, 500, 0.5));
    this.activePiece.addTask(new hydra.task.Sequence([
        hydra.task.StyleTo.linear("opacity", "0", 0.5),
        new hydra.task.SelfDestruct()
    ]));
    this.activePiece = null;
}

tetris.BoardSprite.prototype.onPieceRotated = function (p) {
//    this.activePiece.destroy();
//    this.activePiece.setRotation(this.activePiece.getRotation() - 90);

//    this.activePiece.destroy();
    this.onNextPiece(p);

    this.activePiece.setRotation(-90);
    this.activePiece.addTask(hydra.task.RotateBy.linear(90, 0.1));
}

tetris.BoardSprite.prototype.onPiecePlaced = function (p) {
    for (var ii = 0; ii < p.coords.length; ++ii) {
        var coord = p.coords[ii];
        var block = new hydra.Sprite(tetris.util.createBlock(p.color));
        var bx = p.x + coord[0];
        var by = p.y + coord[1];

        this.blocks[by*tetris.Board.WIDTH + bx] = block;

        block.setXY(bx * tetris.BoardSprite.BLOCK_SIZE, by * tetris.BoardSprite.BLOCK_SIZE);
//        block.centerX = 0.5 * BLOCK_SIZE;
//        block.centerY = 0.5 * BLOCK_SIZE;
        this.addSprite(block);
    }
}

tetris.BoardSprite.prototype.onNextPiece = function (p) {
    if (this.activePiece) {
        this.activePiece.destroy();
    }
    this.activePiece = new tetris.PieceSprite(p);
    this.activePieceChassis.setXY(p.x * tetris.BoardSprite.BLOCK_SIZE,
        p.y * tetris.BoardSprite.BLOCK_SIZE);
    this.activePieceChassis.addSprite(this.activePiece);
}

tetris.BoardSprite.prototype.onRowsCleared = function (rows) {
    var toRemove = [];
    var explosions = new hydra.Group();
    rows.push(0); // Sentinel
    var fallingTasks = [];
    var fallingChunks = [];
    for (var r = 0, ll = rows.length-1; r < ll; ++r) {
        var row = rows[r];
        var explosion = new hydra.Sprite(hydra.dom.div("explosion"));
        explosion.setXY(0, row * tetris.BoardSprite.BLOCK_SIZE);
//        explosion.setXY(-tetris.BoardSprite.BLOCK_SIZE/2,
//            row * tetris.BoardSprite.BLOCK_SIZE - tetris.BoardSprite.BLOCK_SIZE/2);
        //boom.centerX = BLOCK_SIZE;
        //boom.centerY = BLOCK_SIZE;
        explosions.addSprite(explosion);

        for (var col = 0; col < tetris.Board.WIDTH; ++col) {
            var block = this.blocks[row*tetris.Board.WIDTH+ col];
            if (block) {
                hydra.array.push(toRemove, block);
//                this.blocks[row*tetris.Board.WIDTH+col] = null;
            }
        }

        var ii = row-1;
        if (ii > rows[r+1]) {
            var time = Math.sqrt(r+1) / 4;
            do {
                for (var jj = 0; jj < tetris.Board.WIDTH; ++jj) {
                    this.blocks[tetris.Board.WIDTH*(ii+r+1)+jj] = this.blocks[tetris.Board.WIDTH*ii+jj];
                    var block = this.blocks[tetris.Board.WIDTH*ii+jj];
                    if (block) {
                        hydra.array.push(fallingTasks,
                            hydra.task.MoveTo.easeIn(block.x, (ii+r+1)*tetris.BoardSprite.BLOCK_SIZE, time, block));
                    }
                }
                --ii;
            } while (ii > rows[r+1]);
        }

//        var ii = row-1;
//        if (ii > rows[r+1]) {
//            var chunk = new hydra.Group();
//            this.addSprite(chunk);
//
//            do {
//                for (var jj = 0; jj < tetris.Board.WIDTH; ++jj) {
//                    var block = this.blocks[tetris.Board.WIDTH*ii+jj];
//                    this.blocks[tetris.Board.WIDTH*(ii+r+1)+jj] = block;
//                    if (block) {
//                        chunk.addSprite(block);
//                    }
//                }
//                --ii;
//            } while (ii > rows[r+1]);
//
//            var time = Math.sqrt(r+1) / 4;
//            hydra.array.push(fallingTasks,
//                hydra.task.MoveTo.easeIn(0, (r+1)*tetris.BoardSprite.BLOCK_SIZE, time, chunk));
//            hydra.array.push(fallingChunks, chunk);
//        } else {
//            hydra.array.push(fallingChunks, null);
//        }
    }
    explosions.element.style.opacity = "0";
    this.addSprite(explosions);

//    var label = new TextSprite();
//    label.text = ONOMATOPOEIA[Math.floor(Math.random()*ONOMATOPOEIA.length)];
//    label.baseline = "top";
//    label.align = "center";
//    label.font = "bold 16px sans-serif";
//    label.fillStyle = "red";
//    //label.strokeStyle = "orange";
//    label.x = _activePiece.x;
//    label.y = _activePiece.y;
//    //label.cacheAsBitmap = true;
//    add(label);
//
//    this.addTask(new Sequence([
//        new Parallel([
//            ScaleTo.linear(label, 1.5, 1.5, 1),
//            RotateTo.linear(label, (Math.random()-0.5)*(Math.PI/4), 1),
//            MoveTo.linear(label, label.x, label.y-20, 1),
//        ]),
//        new Function(label.destroy)
//    ]));

    this.addTask(new hydra.task.Sequence([
        hydra.task.StyleTo.linear("opacity", "0.8", 0.5, explosions),
        new hydra.task.CallFunction(function () {
            for (var ii = 0, ll = toRemove.length; ii < ll; ++ii) {
                toRemove[ii].destroy();
            }
            explosions.destroy();
        }),
        new hydra.task.Parallel(fallingTasks)
//        new hydra.task.CallFunction(function (dt, group) {
//            for (var ii = 0, ll = fallingChunks.length; ii < ll; ++ii) {
//                var chunk = fallingChunks[ii];
//                if (chunk) {
//                    for (var jj = 0, kk = chunk.getChildCount(); jj < kk; ++jj) {
//                        var block = chunk.getChildAt(0);
//                        block.setY(block.y + (ii+1)*tetris.BoardSprite.BLOCK_SIZE);
//                        group.addSprite(block);
//                    }
//                    chunk.destroy();
//                }
//            }
//        })
    ]));
}
