//
// Block Dream - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("tetris.util");

//goog.require("tetris.BoardSprite");

tetris.util.createBlock = function (color) {
    var block = hydra.dom.div("block");
    block.style.backgroundPosition = -tetris.BoardSprite.BLOCK_SIZE*color + "px 0";
    return block;
}
