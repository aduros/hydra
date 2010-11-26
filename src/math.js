goog.provide("hydra.interpolators");
goog.provide("hydra.math");
goog.provide("hydra.Random");

// All the constants from Math, but inlinable at compile-time
/** @const */ hydra.math.E = 2.718281828459045;
/** @const */ hydra.math.LN2 = 0.6931471805599453;
/** @const */ hydra.math.LN10 = 2.302585092994046;
/** @const */ hydra.math.LOG2E = 1.4426950408889634;
/** @const */ hydra.math.LOG10E = 0.43429448190325176;
/** @const */ hydra.math.PI = 3.141592653589793;
/** @const */ hydra.math.SQRT1_2 = 0.7071067811865476;
/** @const */ hydra.math.SQRT2 = 1.4142135623730951;

/** @const */ hydra.math.INT_MIN = -2147483648;
/** @const */ hydra.math.INT_MAX = 2147483647;
/** @const */ hydra.math.NUMBER_MIN = 1.79769313486231e+308;
/** @const */ hydra.math.NUMBER_MAX = -1.79769313486231e+308; 

/**
 * @param {number} n
 * @return {number}
 * @inline
 */
hydra.math.toInt = function (n) {
    return n | 0;
}

/**
 * @param {number} n
 * @return {number}
 * @inline
 */
hydra.math.abs = function (n) {
    return (n < 0) ? -n : n;
}

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 * @inline
 */
hydra.math.max = function (a, b) {
    return (a > b) ? a : b;
}

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 * @inline
 */
hydra.math.min = function (a, b) {
    return (a < b) ? a : b;
}

/**
 * @return {number}
 */
hydra.math.random = Math.random;

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 * @inline
 */
hydra.math.randomInt = function (a, b) {
    return hydra.math.toInt(hydra.math.random() * (b-a) + a);
}

/**
 * @param {Array} arr
 * @return {number}
 * @inline
 */
hydra.math.pickRandom = function (arr) {
    return arr[hydra.math.toInt(hydra.math.random()*arr.length)];
}

/**
 * @param {number} n
 * @return {boolean}
 * @inline
 */
hydra.math.isOdd = function (n) {
    return Boolean(n & 1);
}

/**
 * @param {number} n
 * @return {boolean}
 * @inline
 */
hydra.math.isEven = function (n) {
    return !hydra.math.isOdd(n);
}

/**
 * @param {number} rad
 * @return {number}
 * @inline
 */
hydra.math.toDegrees = function (rad) {
    return 180/hydra.math.PI * rad;
}

/**
 * @param {number} deg
 * @return {number}
 * @inline
 */
hydra.math.toRadians = function (deg) {
    return hydra.math.PI/180 * deg;
}

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @return {number}
 * @inline
 */
hydra.math.clamp = function (n, min, max) {
    return n > max ? max : (n < min ? min : n);
}

// TODO: hydra.Interpolator typedef

hydra.interpolators.LINEAR = function (t, a, b, d) {
    return a + (b-a) * (t/d);
}

// TODO
hydra.interpolators.EASE_IN = function (t, a, b, d) {
    t /= d;
    return (b-a)*t*t + a;
}

// TODO
hydra.interpolators.EASE_OUT = hydra.interpolators.LINEAR;

/**
 * @constructor
 * @param {number} a
 * @param {number} b
 */
hydra.Random = function(a, b) {
    this.a = a;
    this.b = b;
}

/**
 * @return {hydra.Random}
 */
hydra.Random.create = function () {
    return new hydra.Random(
        hydra.math.randomInt(hydra.math.INT_MIN, hydra.math.INT_MAX+1),
        hydra.math.randomInt(hydra.math.INT_MIN, hydra.math.INT_MAX+1));
}

/**
 * @return {number}
 */
hydra.Random.prototype.nextInt = function () {
    this.a = 36969 * (this.a & 65535) + (this.a >> 16);
    this.b = 18000 * (this.b & 65535) + (this.b >> 16);
    return (this.a << 16) + (this.b & 65535);
}

/**
 * @return {number}
 */
hydra.Random.prototype.nextNumber = function () {
    return (this.nextInt() + (hydra.math.INT_MAX+1)) / (2*hydra.math.INT_MAX+2);
}

/**
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
hydra.Random.prototype.nextRange = function (x, y) {
    return (this.nextInt() & hydra.math.INT_MAX) % (y-x) + x;
}
