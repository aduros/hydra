goog.provide("hydra.platform");

/**
 * @enum {number}
 * @private
 */
hydra.platform.Target = {
    // Do not change without updating hydra.rake
    UNSUPPORTED: 0,
    WEBKIT: 1,
    FF3: 2,
    FF4: 3,
    IE9: 4,
    OPERA: 5
};

/**
 * @define {number}
 */
hydra.platform.COMPILED_TARGET = 1;

/**
 * @type {string}
 * @const
 */
hydra.platform.VENDOR_PREFIX = (function () {
    // Use an if-else chain instead of switch so this gets folded at compile time
    if (hydra.platform.COMPILED_TARGET == hydra.platform.Target.WEBKIT) {
        return "webkit";
    } else if (hydra.platform.COMPILED_TARGET == hydra.platform.Target.FF3) {
        return "moz";
    } else if (hydra.platform.COMPILED_TARGET == hydra.platform.Target.FF4) {
        return "moz";
    } else if (hydra.platform.COMPILED_TARGET == hydra.platform.Target.IE9) {
        return "ms";
    } else if (hydra.platform.COMPILED_TARGET == hydra.platform.Target.OPERA) {
        return "o";
    } else {
        return null;
    }
})();

// Environments
hydra.platform.IS_WEBKIT = (hydra.platform.COMPILED_TARGET == hydra.platform.Target.WEBKIT);
hydra.platform.IS_OPERA = (hydra.platform.COMPILED_TARGET == hydra.platform.Target.OPERA);
hydra.platform.IS_FF3 = (hydra.platform.COMPILED_TARGET == hydra.platform.Target.FF3);
hydra.platform.IS_FF4 = (hydra.platform.COMPILED_TARGET == hydra.platform.Target.FF4);
hydra.platform.IS_GECKO = (hydra.platform.COMPILED_TARGET == hydra.platform.Target.FF3
    || hydra.platform.COMPILED_TARGET == hydra.platform.Target.FF4);
hydra.platform.IS_UNSUPPORTED =
    (hydra.platform.COMPILED_TARGET == hydra.platform.Target.UNSUPPORTED);
hydra.platform.IS_IE9 = (hydra.platform.COMPILED_TARGET == hydra.platform.Target.IE9);

// Capabilities
hydra.platform.HAS_CSS_TRANSITIONS = hydra.platform.IS_WEBKIT; // || hydra.platform.IS_FF4;
hydra.platform.HAS_TRANSLATE3D = hydra.platform.IS_WEBKIT;
hydra.platform.HAS_REQUEST_ANIMATION = hydra.platform.IS_FF4;
hydra.platform.HAS_CLASS_LIST = hydra.platform.IS_FF4; // Recent webkits also have it, but meh
hydra.platform.HAS_APP_CACHE = hydra.platform.IS_WEBKIT || hydra.platform.IS_GECKO
    || hydra.platform.IS_OPERA;

/**
 * Prefix a css property with the proper vendor prefix.
 * @inline
 */
hydra.platform.prefixCss = function (propName) {
    return "-" + hydra.platform.VENDOR_PREFIX + "-" + propName;
}
