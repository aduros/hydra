//
// Block Dream - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("tetris.Piece");

goog.require("hydra.math");

/**
 * @constructor
 * @param {number} color
 * @param {Array.<Array>} coords
 */
tetris.Piece = function (color, coords) {
    this.color = color;
    this.coords = coords;
}

tetris.Piece.PRESETS = [
    new tetris.Piece(1, [
        [ -1, -1 ],
        [ -1, 0 ],
        [ 0, 0 ],
        [ 0, -1 ]
    ]),
    new tetris.Piece(6, [
        [ -2, 0 ],
        [ -1, 0 ],
        [ 0, 0 ],
        [ 1, 0 ]
    ]),
    new tetris.Piece(2, [
        [ 0, -1 ],
        [ 1, -1 ],
        [ 0, 0 ],
        [ -1, 0 ]
    ]),
    new tetris.Piece(0, [
        [ 0, -1 ],
        [ -1, -1 ],
        [ 0, 0 ],
        [ 1, 0 ]
    ]),
    new tetris.Piece(4, [
        [ -1, -1 ],
        [ -1, 0 ],
        [ 0, 0 ],
        [ 1, 0 ]
    ]),
    new tetris.Piece(3, [
        [ 1, -1 ],
        [ -1, 0 ],
        [ 0, 0 ],
        [ 1, 0 ]
    ]),
    new tetris.Piece(5, [
        [ 0, -1 ],
        [ -1, 0 ],
        [ 0, 0 ],
        [ 1, 0 ]
    ])
];

tetris.Piece.createRandom = function () {
    var preset = hydra.math.pickRandom(tetris.Piece.PRESETS);
    return preset;
//    return new tetris.Piece(preset.color, preset.coords);
}

tetris.Piece.prototype.rotate = function () {
    if (this == tetris.Piece.PRESETS[0]) {
//    if (this.coords == tetris.Piece.PRESETS[0].coords) {
        // Don't rotate the 2x2 square
        return null;
    } else {
        var next = [];
        for (var ii = 0; ii < this.coords.length; ++ii) {
            var coord = this.coords[ii];
            hydra.array.push(next, [ -coord[1], coord[0] ]);
        }
        var rotated = new tetris.Piece(this.color, next);
        rotated.x = this.x;
        rotated.y = this.y;
        return rotated;
    }
}
