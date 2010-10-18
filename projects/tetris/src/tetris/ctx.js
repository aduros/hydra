goog.provide("tetris.ctx");

/** @type {tetris.Board} */
tetris.ctx.board;

///** @type {hydra.Music} */
//tetris.ctx.music;

tetris.ctx.account = hydra.storage.get("tetris") || {};

tetris.ctx.saveAccount = function () {
    hydra.storage.set("tetris", tetris.ctx.account);
}
