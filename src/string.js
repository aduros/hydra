//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.string");

hydra.string.count = function (source, pattern) {
    var total = 0;
    for (var ii = 0; ii = source.indexOf(pattern, ii) + 1; ++total) { }
    return total;
}

hydra.string.replaceAll = function (string, a, b) {
    return string.split(a).join(b);
}

/**
 * @param {number} then
 * @param {number=} now
 */
hydra.string.fromDate = function (then, now) {
    now = now || Date.now();

    var delta = now - then;

    var SECOND = 1000;
    var MINUTE = 60 * SECOND;
    var HOUR = 60 * MINUTE;
    var DAY = 24 * HOUR;
    var MONTH = 30 * DAY;
    var YEAR = 12 * MONTH;

    if (delta < 1 * MINUTE) {
          return "just now";
    }
    if (delta < 2 * MINUTE) {
          return "one minute ago";
    }
    if (delta < 60 * MINUTE) {
        return Math.round(delta/MINUTE) + " minutes ago";
    }
    if (delta < 90 * MINUTE) {
          return "one hour ago";
    }
    if (delta < 24 * HOUR) {
        return Math.round(delta/HOUR) + " hours ago";
    }
    if (delta < 48 * HOUR) {
          return "yesterday";
    }
    if (delta < 30 * DAY) {
        return Math.round(delta/DAY) + " days ago";
    }
    if (delta < 1.5 * MONTH) {
        return "one month ago";
    }
    if (delta < 12 * MONTH) {
        return Math.round(delta/MONTH) + " months ago";
    }
    if (delta < 2 * YEAR) {
        return "one year ago";
    }
    return Math.round(delta/YEAR) + " years ago";
}
