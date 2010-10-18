goog.provide("tetris.util");

//goog.require("tetris.BoardSprite");

tetris.util.createBlock = function (color) {
    var block = hydra.dom.div("block");
    block.style.backgroundPositionX = -tetris.BoardSprite.BLOCK_SIZE*color + "px";
    return block;
}
