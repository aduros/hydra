goog.provide("hydra.dom");

goog.require("hydra.platform");

/**
 * @param {Element} element
 * @param {string} className
 */
hydra.dom.hasClass = function (element, className) {
    // TODO: Use classList for supported browsers?
    return (" " + element.className + " ").indexOf(" " + className + " ") >= 0;
//    return RegExp("\\b" + className + "\\b").test(element.className);
}

/**
 * @param {Element} element
 * @param {string} className
 */
hydra.dom.addClass = function (element, className) {
    // TODO: Use classList for supported browsers?
    if (element.className) {
        if (!hydra.dom.hasClass(element, className)) {
            element.className += " " + className;
        }
    } else {
        element.className = className;
    }
}

/**
 * @param {Element} element
 * @param {string} className
 */
hydra.dom.removeClass = function (element, className) {
    // TODO: Use classList for supported browsers?

    //var x = (" " + element.className + " ");
    //element.className = x.replace(" " + className + " ", " ");//.trim();

    var arr = element.className.split(" ");
    var idx = arr.indexOf(className);
    if (idx >= 0) {
        arr.splice(idx, 1);
        element.className = arr.join(" ");
    }
}

/**
 * @param {Element} element
 * @param {string} from
 * @param {string} to
 */
hydra.dom.replaceClass = function (element, from, to) {
    var x = (" " + element.className + " ");
    element.className = x.replace(" " + from + " ", " " + to + " ");//.trim();
}

/**
 * @param {CSSStyleDeclaration} style
 * @param {string} property
 * @param {string} duration
 * @param {string} timingFunction
 */
hydra.dom.addTransition = function (style, property, duration, timingFunction) {
    var transitionProperty = style[hydra.platform.VENDOR_PREFIX + "TransitionProperty"];
    if (transitionProperty) {
        var allProperties = transitionProperty.split(", ");
        var idx = allProperties.indexOf(property);
        if (idx < 0) {
            // Append a new transition
            style[hydra.platform.VENDOR_PREFIX + "TransitionProperty"] += ", " + property;
            style[hydra.platform.VENDOR_PREFIX + "TransitionDuration"] += ", " + duration;
            style[hydra.platform.VENDOR_PREFIX + "TransitionTimingFunction"] += ", " + timingFunction;

        } else {
            // Update the existing transition settings to the new values
            var allDurations = style[hydra.platform.VENDOR_PREFIX + "TransitionDuration"].split(", ");
            allDurations[idx] = duration;
            style[hydra.platform.VENDOR_PREFIX + "TransitionDuration"] = allDurations.join(", ");

            var allTimingFunctions = style[hydra.platform.VENDOR_PREFIX + "TransitionTimingFunction"].split(", ");
            allTimingFunctions[idx] = duration;
            style[hydra.platform.VENDOR_PREFIX + "TransitionTimingFunction"] = allTimingFunctions.join(", ");
        }

    } else {
        // transition-property is empty, just set them
        style[hydra.platform.VENDOR_PREFIX + "TransitionProperty"] = property;
        style[hydra.platform.VENDOR_PREFIX + "TransitionDuration"] = duration;
        style[hydra.platform.VENDOR_PREFIX + "TransitionTimingFunction"] = timingFunction;
    }
}

/**
 * @param {CSSStyleDeclaration} style
 * @param {string} property
 */
hydra.dom.removeTransition = function (style, property) {
    var transitionProperty = style[hydra.platform.VENDOR_PREFIX + "TransitionProperty"];
    if (transitionProperty) {
        var allProperties = transitionProperty.split(", ");
        var idx = allProperties.indexOf(property);
        if (idx >= 0) {
            if (allProperties.length > 1) {
                allProperties.splice(idx, 1);
                style[hydra.platform.VENDOR_PREFIX + "TransitionProperty"] = allProperties.join(", ");

                var allDurations = style[hydra.platform.VENDOR_PREFIX + "TransitionDuration"].split(", ");
                allDurations.splice(idx, 1);
                style[hydra.platform.VENDOR_PREFIX + "TransitionDuration"] = allDurations.join(", ");

                var allTimingFunctions = style[hydra.platform.VENDOR_PREFIX + "TransitionTimingFunction"].split(", ");
                allTimingFunctions.splice(idx, 1);
                style[hydra.platform.VENDOR_PREFIX + "TransitionTimingFunction"] = allTimingFunctions.join(", ");

            } else {
                // Shortcut: If this property was the only transition, simply clear everything
                style[hydra.platform.VENDOR_PREFIX + "TransitionProperty"] = "";
                style[hydra.platform.VENDOR_PREFIX + "TransitionDuration"] = "";
                style[hydra.platform.VENDOR_PREFIX + "TransitionTimingFunction"] = "";
            }
        }
    }
}

/**
 * @param {string} className
 */
hydra.dom.div = function (className) {
    var div = document.createElement("div");
    div.className = className;
    return div;
}

/**
 * @param {string} html
 */
hydra.dom.renderDiv = function (html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div;
}
