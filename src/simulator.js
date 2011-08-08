//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.simulator");

hydra.simulator.supportsTouch = true;
try {
    document.createEvent("TouchEvent");
} catch (_) {
    hydra.simulator.supportsTouch = false;
}

/**
 * @private
 */
hydra.simulator.touchTarget = null;

/**
 * @private
 */
hydra.simulator.identifier = 0;

/**
 * @param {Event} e
 */
hydra.simulator.handleMouse = function (e) {
    e.preventDefault();

    var touchType = "";
    switch (e.type) {
        case "mousedown":
            touchType = "touchstart";
            hydra.simulator.touchTarget = e.target;
            break;
        case "mousemove":
            if (!hydra.simulator.touchTarget) {
                return;
            }
            touchType = "touchmove";
            break;
        case "mouseup":
            touchType = "touchend";
            hydra.simulator.identifier++;
            break;
    }

    var touch = {
        "clientX": e.clientX,
        "clientY": e.clientY,
        "identifier": hydra.simulator.identifier,
        "pageX": e.pageX,
        "pageY": e.pageY,
        "screenX": e.screenX,
        "screenY": e.screenY,
        "target": hydra.simulator.touchTarget
    };

    var touchEvent = document.createEvent("UIEvent");
    touchEvent.initEvent(touchType, true, false);
//    var touchEvent = document.createEvent("TouchEvent");
//    touchEvent["initTouchEvent"](touchType, e.bubbles, e.cancelable, e.view, e.detail, e.screenX,
//        e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey);

    // Chrome doesn't set the touch type in initEvent?
    // FIXME: FF does, but complains if you set it afterward
    if (hydra.platform.IS_WEBKIT) {
        touchEvent.type = touchType;
    }
    touchEvent.touches = (touchType == "touchend") ? [] : [touch];
    touchEvent.targetTouches = (touchType == "touchend") ? [] : [touch];
    touchEvent.changedTouches = [touch];

    hydra.simulator.touchTarget.dispatchEvent(touchEvent);

    if (touchType == "touchend") {
        hydra.simulator.touchTarget = null;
    }
}

hydra.simulator.init = function () {
    document.addEventListener("mousemove", hydra.simulator.handleMouse, true);
    document.addEventListener("mouseup", hydra.simulator.handleMouse, true);
    document.addEventListener("mousedown", hydra.simulator.handleMouse, true);
}
