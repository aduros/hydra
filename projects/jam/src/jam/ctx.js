goog.provide("jam.ctx");

goog.require("hydra.storage");

goog.require("jam.Board");

/** @type {jam.Board} */
jam.ctx.board;

/** @type {HTMLAudioElement} */
jam.ctx.music;

jam.ctx.account = hydra.storage.get("jam") || {};

jam.ctx.saveAccount = function () {
    hydra.storage.set("jam", jam.ctx.account);
}
