//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.dom");

goog.require("hydra.platform");

/**
 * @param {Element} element
 * @param {string} className
 * @inline
 */
hydra.dom.hasClass = function (element, className) {
    if (hydra.platform.HAS_CLASS_LIST) {
        return element["classList"]["contains"](className);
    } else {
        return (" " + element.className + " ").indexOf(" " + className + " ") >= 0;
        //return RegExp("\\b" + className + "\\b").test(element.className);
    }
}

/**
 * @param {Element} element
 * @param {string} className
 * @inline
 */
hydra.dom.addClass = function (element, className) {
    if (element.className) {
        if (hydra.platform.HAS_CLASS_LIST) {
            return element["classList"]["add"](className);
        } else if (!hydra.dom.hasClass(element, className)) {
            element.className += " " + className;
        }
    } else {
        element.className = className;
    }
}

/**
 * @param {Element} element
 * @param {string} className
 * @inline
 */
hydra.dom.removeClass = function (element, className) {
    //var x = (" " + element.className + " ");
    //element.className = x.replace(" " + className + " ", " ");//.trim();
    if (hydra.platform.HAS_CLASS_LIST) {
        element["classList"]["remove"](className);
    } else {
        var arr = element.className.split(" ");
        var idx = arr.indexOf(className);
        if (idx >= 0) {
            arr.splice(idx, 1);
            element.className = arr.join(" ");
        }
    }
}

/**
 * @param {Element} element
 * @param {string} from
 * @param {string} to
 * @inline
 */
hydra.dom.replaceClass = function (element, from, to) {
    // TODO: Use classList here? Not sure if a remove() then add would be faster
    var x = (" " + element.className + " ");
    element.className = x.replace(" " + from + " ", " " + to + " ");//.trim();
}

/**
 * @param {Element} element
 * @param {string} className
 * @inline
 */
hydra.dom.toggleClass = function (element, className) {
    if (hydra.platform.HAS_CLASS_LIST) {
        element["classList"]["toggle"](className);
    } else if (hydra.dom.hasClass(element, className)) {
        hydra.dom.removeClass(element, className);
    } else {
        hydra.dom.addClass(element, className);
    }
}

/**
 * @param {CSSStyleDeclaration} style
 * @param {string} property
 * @param {string} duration
 * @param {string} timingFunction
 */
hydra.dom.addTransition = function (style, property, duration, timingFunction) {
    var transitionProperty = style.getPropertyValue(
        hydra.platform.prefixCss("transition-property"));
    if (transitionProperty) {
        var allProperties = transitionProperty.split(", ");
        var idx = allProperties.indexOf(property);
        if (idx < 0) {
            // Append a new transition
            style.setProperty(hydra.platform.prefixCss("transition-property"),
                transitionProperty + ", " + property, "");
            style.setProperty(hydra.platform.prefixCss("transition-duration"),
                style.getPropertyValue(hydra.platform.prefixCss("transition-duration")) + ", " + duration, "");
            style.setProperty(hydra.platform.prefixCss("transition-timing-function"),
                style.getPropertyValue(hydra.platform.prefixCss("transition-timing-function")) + ", " + timingFunction, "");

        } else {
            // Update the existing transition settings to the new values
            var allDurations = style.getPropertyValue(
                hydra.platform.prefixCss("transition-duration")).split(", ");
            allDurations[idx] = duration;
            style.setProperty(hydra.platform.prefixCss("transition-duration"),
                allDurations.join(", "), "");

            var allTimingFunctions = style.getPropertyValue(
                hydra.platform.prefixCss("transition-timing-function")).split(", ");
            allTimingFunctions[idx] = timingFunction;
            style.setProperty(hydra.platform.prefixCss("transition-timing-function"),
                allTimingFunctions.join(", "), "");
        }

    } else {
        // transition-property is empty, just set them
        style.setProperty(hydra.platform.prefixCss("transition-property"), property, "");
        style.setProperty(hydra.platform.prefixCss("transition-duration"), duration, "");
        style.setProperty(hydra.platform.prefixCss("transition-timing-function"), timingFunction, "");
    }
}

/**
 * @param {CSSStyleDeclaration} style
 * @param {string} property
 */
hydra.dom.removeTransition = function (style, property) {
    var transitionProperty = style.getPropertyValue(
        hydra.platform.prefixCss("transition-property"));
    if (transitionProperty) {
        var allProperties = transitionProperty.split(", ");
        var idx = allProperties.indexOf(property);
        if (idx >= 0) {
            if (allProperties.length > 1) {
                allProperties.splice(idx, 1);
                style.setProperty(hydra.platform.prefixCss("transition-property"),
                    allProperties.join(", "), "");

                var allDurations = style.getPropertyValue(
                    hydra.platform.prefixCss("transition-duration")).split(", ");
                allDurations.splice(idx, 1);
                style.setProperty(hydra.platform.prefixCss("transition-duration"),
                    allDurations.join(", "), "");

                var allTimingFunctions = style.getPropertyValue(
                    hydra.platform.prefixCss("transition-timing-function")).split(", ");
                allTimingFunctions.splice(idx, 1);
                style.setProperty(hydra.platform.prefixCss("transition-timing-function"),
                    allTimingFunctions.join(", "), "");
            } else {
                // Shortcut: If this property was the only transition, simply clear everything
                style.setProperty(hydra.platform.prefixCss("transition-property"), "", "");
                style.setProperty(hydra.platform.prefixCss("transition-duration"), "", "");
                style.setProperty(hydra.platform.prefixCss("transition-timing-function"), "", "");
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
    if (div.childElementCount == 1) {
        div = div.firstElementChild;
    }
    return div;
}
