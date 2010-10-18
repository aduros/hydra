goog.provide("tetris.Board");

goog.require("hydra.array");
goog.require("hydra.math");
goog.require("hydra.EventDispatcher");

goog.require("tetris.Piece");
goog.require("tetris.BoardEvent");

/**
 * @constructor
 * @extends {hydra.EventDispatcher}
 */
tetris.Board = function () {
    goog.base(this);
}
goog.inherits(tetris.Board, hydra.EventDispatcher);

tetris.Board.WIDTH = 10;
tetris.Board.HEIGHT = 20;

tetris.Board.prototype.startGame = function () {
    this.blocks = [];
    this.playing = true;
    this.preview = tetris.Piece.createRandom();
    this.rowsCleared = 0;
    this.score = 0;
    this.level = 1;

    this.dispatchEvent(tetris.BoardEvent.LEVEL_CHANGED);
    this.dispatchEvent(tetris.BoardEvent.SCORE_CHANGED);
    this.nextPiece();
}

tetris.Board.prototype.step = function () {
    if (this.playing && !this.movePiece(0, 1)) {
        this.placePiece();
        this.clearFilledRows();
        this.nextPiece();
    }
}

tetris.Board.prototype.rotate = function () {
    var rotated = this.piece.rotate();
    if (rotated && this.isValid(rotated)) {
        this.piece = rotated;
        this.dispatchEvent(tetris.BoardEvent.PIECE_ROTATED, this.piece);
    }
}

tetris.Board.prototype.clearFilledRows = function () {
    var filledRows = [];
    label: for (var ii = 0; ii < this.piece.coords.length; ++ii) {
        var coord = this.piece.coords[ii];
        var row = this.piece.y + coord[1];
        if (!hydra.array.contains(filledRows, row)) {
            for (var col = 0; col < tetris.Board.WIDTH; ++col) {
                if (!this.blocks[row*tetris.Board.WIDTH+col]) {
                    continue label;
                }
            }
            hydra.array.push(filledRows, row);
        }
    }
    if (!hydra.array.isEmpty(filledRows)) {
        filledRows.sort();
        for (var ii = 0; ii < filledRows.length; ++ii) {
            var y = filledRows[ii];
            while (y > 0) {
                for (var x = 0; x < tetris.Board.WIDTH; ++x) {
                    this.blocks[y*tetris.Board.WIDTH+x] = this.blocks[(y-1)*tetris.Board.WIDTH+x];
                }
                --y;
            }
        }
        filledRows.reverse();

        var count = filledRows.length;
        this.score += this.level * [40,100,300,1200][count-1];

        this.rowsCleared += count;
        var nextLevel = 1+hydra.math.toInt(this.rowsCleared/4);
        if (nextLevel != this.level) {
            this.level = nextLevel;
            this.dispatchEvent(tetris.BoardEvent.LEVEL_CHANGED);
        }

        this.dispatchEvent(tetris.BoardEvent.ROWS_CLEARED, filledRows);
        this.dispatchEvent(tetris.BoardEvent.SCORE_CHANGED);
    }
}

tetris.Board.prototype.drop = function () {
    while (this.isValid(this.piece)) {
        this.piece.y += 1;
    }
    this.piece.y -= 1;
    this.dispatchEvent(tetris.BoardEvent.PIECE_DROPPED, this.piece);
    this.step();
}

tetris.Board.prototype.movePiece = function (dx, dy) {
    var nx = this.piece.x + dx;
    var ny = this.piece.y + dy;

    for (var ii = 0; ii < this.piece.coords.length; ++ii) {
        var coord = this.piece.coords[ii];
        if (this.isBlocked(nx+coord[0], ny+coord[1])) {
            return false;
        }
    }

    this.piece.x = nx;
    this.piece.y = ny;

    this.dispatchEvent(tetris.BoardEvent.PIECE_MOVED, this.piece, dx, dy);
    return true;
}

tetris.Board.prototype.dropPiece = function () {
    while (this.isValid(this.piece)) {
        this.piece.y += 1;
    }
    this.piece.y -= 1;

    this.dispatchEvent(tetris.BoardEvent.PIECE_DROPPED, this.piece);
}

tetris.Board.prototype.isValid = function (piece) {
    for (var ii = 0; ii < piece.coords.length; ++ii) {
        var coord = piece.coords[ii];
        if (this.isBlocked(piece.x + coord[0], piece.y + coord[1])) {
            return false;
        }
    }
    return true;
}

tetris.Board.prototype.isBlocked = function (x, y) {
    return x < 0
        || x >= tetris.Board.WIDTH
        || y < 0
        || y >= tetris.Board.HEIGHT
        || this.blocks[y*tetris.Board.WIDTH+x];
}

tetris.Board.prototype.placePiece = function () {
    for (var ii = 0; ii < this.piece.coords.length; ++ii) {
        var coord = this.piece.coords[ii];
        var x = this.piece.x + coord[0];
        var y = this.piece.y + coord[1];
        this.blocks[y*tetris.Board.WIDTH+x] = true;
    }
    this.dispatchEvent(tetris.BoardEvent.PIECE_PLACED, this.piece);
}

tetris.Board.prototype.nextPiece = function () {
    this.piece = this.preview;
    this.piece.x = hydra.math.toInt(tetris.Board.WIDTH/2);
    this.piece.y = 2;

    this.preview = tetris.Piece.createRandom();

    if (!this.isValid(this.piece)) {
        this.endGame();
    } else {
        this.dispatchEvent(tetris.BoardEvent.NEXT_PIECE, this.piece, this.preview);
    }
}

tetris.Board.prototype.endGame = function () {
    this.playing = false;
    this.dispatchEvent(tetris.BoardEvent.GAME_OVER);
}
