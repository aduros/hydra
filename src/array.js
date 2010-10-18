goog.provide("hydra.array");

/**
 * @param {Array} arr
 * @param {Object} x
 */
hydra.array.remove = function (arr, x) {
    var ii = arr.indexOf(x);
    if (ii >= 0) {
        arr.splice(ii, 1);
        return true;
    } else {
        return false;
    }
}

/**
 * @param {Array} arr
 * @param {Object|number|string} x
 */
// Faster than Array.prototype.push() when inlined (except in Chrome)
hydra.array.push = function (arr, x) {
    arr[arr.length] = x;
}

/**
 * @param {Array} arr
 */
// Faster than Array.prototype.pop() if you don't need the popped value
hydra.array.pop = function (arr) {
    if (arr.length > 0) {
        --arr.length;
    }
}

/**
 * @param {Array} arr
 */
hydra.array.shuffle = function (arr) {
    for (var ii = arr.length - 1; ii > 0; --ii) {
    //for (var ii = arr.length; ii && --ii;) {
        var jj = hydra.math.randomInt(0, ii+1);
        var swap = arr[jj];
        arr[jj] = arr[ii];
        arr[ii] = swap;
    }
}

/**
 * @param {Array} arr
 */
hydra.array.clone = function (arr) {
    return arr.slice();
}

hydra.array.fromArgs = function (args) {
    return Array.prototype.slice.apply(args);
}

// Slower than slice copy
//hydra.array.resetWith = function (arr, newContents) {
//    arr.length = 0;
//    Array.prototype.push.apply(arr, newContents);
//}
//
//hydra.array.reset = function (arr) {
//    arr.length = 0;
//}

hydra.array.contains = function (arr, x) {
    return arr.indexOf(x) >= 0;
}

hydra.array.isEmpty = function (arr) {
    return !arr.length;
}
