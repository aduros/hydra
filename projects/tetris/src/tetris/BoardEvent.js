goog.provide("tetris.BoardEvent");

/**
 * @enum {number}
 */
tetris.BoardEvent = {
    PIECE_MOVED: 0, //(p :Piece, dx :Int, dy :Int);
    PIECE_DROPPED: 1, //(p :Piece);
    PIECE_PLACED: 2, //(p :Piece);
    PIECE_ROTATED: 3, //(p :Piece);
    NEXT_PIECE: 4, //(piece :Piece, preview :Piece);
    ROWS_CLEARED: 5, //(rows :Array<Int>);
    SCORE_CHANGED: 6, //;
    LEVEL_CHANGED: 7, //;
    GAME_OVER: 8 //;
};
