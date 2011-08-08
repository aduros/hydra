//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.EventDispatcher");
goog.provide("hydra.ListenerManager");

goog.require("hydra.array");

/** @constructor */
hydra.EventDispatcher = function () {
    /**
     * @private
     */
    this.listenerMap = {};
}

hydra.EventDispatcher.prototype.addEventListener = function (name, handler) {
    var handlers = this.listenerMap[name];
    if (handlers == null) {
        this.listenerMap[name] = [ handler ];
    } else {
        hydra.array.push(handlers, handler);
    }
}

hydra.EventDispatcher.prototype.removeEventListener = function (name, handler) {
    var handlers = this.listenerMap[name];
    if (handlers != null) {
        hydra.array.remove(handlers, handler);
    }
}

/**
 * @param {string|number} name
 * @param {...*} var_args
 */
hydra.EventDispatcher.prototype.dispatchEvent = function (name, var_args) {
    var handlers = this.listenerMap[name];
    if (handlers != null) {
        var args = hydra.array.fromArgs(arguments);
        args.shift();
        for (var ii = 0; ii < handlers.length; ++ii) {
            var handler = handlers[ii];
            handler.apply(undefined, args);
        }
    }
}

/**
 * @constructor
 */
hydra.ListenerManager = function () {
    /**
     * @type Array.<hydra.RegisteredListener>
     * @private
     */
     this.listeners = [];
}

/**
 * @param {EventTarget|hydra.EventDispatcher} dispatcher
 * @param {string|number} eventName
 */
hydra.ListenerManager.prototype.registerListener = function (dispatcher, eventName, handler) {
    hydra.array.push(this.listeners, new hydra.RegisteredListener(dispatcher, eventName, handler));
    dispatcher.addEventListener(eventName, handler, false);
}

/**
 * @param {EventTarget|hydra.EventDispatcher} dispatcher
 * @param {string|number} eventName
 */
hydra.ListenerManager.prototype.unregisterListener = function (dispatcher, eventName, handler) {
    for (var ii = 0; ii < this.listeners.length; ++ii) {
        var listener = this.listeners[ii];
        if (listener.dispatcher == dispatcher &&
            listener.eventName == eventName &&
            listener.handler == handler) {
            this.listeners.splice(ii, 1);
            break;
        }
    }
    dispatcher.removeEventListener(eventName, handler, false);
}

hydra.ListenerManager.prototype.unregisterAllListeners = function () {
    //for (var ii = 0, ll = this.listeners.length; ii < ll; ++ii) {
    for (var ii = 0; ii < this.listeners.length; ++ii) {
        var listener = this.listeners[ii];
        listener.dispatcher.removeEventListener(listener.eventName, listener.handler, false);
    }
    this.listeners = [];
}

/**
 * @constructor
 * @private
 */
hydra.RegisteredListener = function (dispatcher, eventName, handler) {
    this.dispatcher = dispatcher;
    this.eventName = eventName;
    this.handler = handler;
}
