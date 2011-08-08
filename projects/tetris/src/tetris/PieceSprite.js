//
// Block Dream - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("tetris.PieceSprite");

goog.require("tetris.util");

/**
 * @constructor
 * @extends {hydra.Sprite}
 * @param {tetris.Piece} piece
 */
tetris.PieceSprite = function (piece) {
    goog.base(this);

//    this.setXY(piece.x * tetris.BoardSprite.BLOCK_SIZE, piece.y * tetris.BoardSprite.BLOCK_SIZE);
    // TODO: center

    for (var ii = 0; ii < piece.coords.length; ++ii) {
        var coord = piece.coords[ii];
        var block = tetris.util.createBlock(piece.color);
        block.style.left = coord[0] * tetris.BoardSprite.BLOCK_SIZE + "px";
        block.style.top = coord[1] * tetris.BoardSprite.BLOCK_SIZE + "px";
        this.element.appendChild(block);
    }
}
goog.inherits(tetris.PieceSprite, hydra.Sprite);
