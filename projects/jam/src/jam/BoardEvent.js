//
// Fruit Link - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("jam.BoardEvent");

/**
 * @enum {number}
 */
jam.BoardEvent = {
    PATH_CLEARED: 0,
    PATH_CANCELED: 1,
    SCORE_CHANGED: 2,
    GAME_OVER: 3,
    GAME_STARTED: 4
};
