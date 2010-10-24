goog.provide("hydra.Sprite");
goog.provide("hydra.Group");
goog.provide("hydra.task.AnimateCss");
goog.provide("hydra.task.MoveTo");
goog.provide("hydra.task.MoveBy");
goog.provide("hydra.task.ScaleTo");
goog.provide("hydra.task.ScaleBy");
goog.provide("hydra.task.RotateTo");
goog.provide("hydra.task.RotateBy");

goog.require("hydra.dom");
goog.require("hydra.interpolators");
goog.require("hydra.array");
goog.require("hydra.Pool");
//goog.require("hydra.Entity");
goog.require("hydra.dom");

/**
 * @constructor
 * @extends hydra.Entity
 * @param {Element|string|hydra.Pool=} source
 */
hydra.Sprite = function (source) {
    goog.base(this);

    if (!source) {
        source = document.createElement("div");

    } else if (source instanceof hydra.Pool) {
        /** 
         * @protected
         * @type {hydra.Pool}
         */
        this.pool = source;
        source = source.alloc();
    }

    /**
     * //@protected
     * @type {HTMLElement}
     */
    this.element = source;

    /**
     * @protected
     * @type {hydra.Group}
     */
    this.parent;

    /**
     * @protected
     * @type {number}
     */
    this.x = 0;

    /**
     * @protected
     * @type {number}
     */
    this.y = 0;

    /**
     * @protected
     * @type {number}
     */
    this.scaleX = 1;

    /**
     * @protected
     * @type {number}
     */
    this.scaleY = 1;

    /**
     * @protected
     * @type {number}
     */
    this.rotation = 0;
}
goog.inherits(hydra.Sprite, hydra.Entity);

hydra.Sprite.DIV_POOL = new hydra.Pool();
hydra.Sprite.DIV_POOL.createObject = function () {
    return document.createElement("div");
}
hydra.Sprite.DIV_POOL.destroyObject = function (div) {
    div.parentNode.removeChild(div);
}

/**
 * @param {string} className
 */
hydra.Sprite.div = function (className) {
    var sprite = new hydra.Sprite(hydra.Sprite.DIV_POOL);
    sprite.element.className = className;
    return sprite;
}

hydra.Sprite.prototype.detach = function () {
    if (this.parent) {
        this.parent.removeSprite(this);

    } else if (this.pool) {
        this.element.style.visibility = "hidden";

    } else if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
    }
}

/** @override */
hydra.Sprite.prototype.destroy = function () {
    goog.base(this, "destroy");

    if (this.pool) {
        // Clean up the element and return it to the pool
        this.element.removeAttribute("style");
        if (this.element.hasChildNodes()) {
            this.element.innerHTML = "";
        }
        this.detach();
        this.pool.free(this.element);
    } else {
        this.detach();
    }
    this.element = null;
}

hydra.Sprite.prototype.setX = function (x) {
    this.x = x;
    this.updateTransform();
}

hydra.Sprite.prototype.getX = function () {
    return this.x;
}

hydra.Sprite.prototype.setY = function (y) {
    this.y = y;
    this.updateTransform();
}

hydra.Sprite.prototype.getY = function () {
    return this.y;
}

hydra.Sprite.prototype.setXY = function (x, y) {
    this.x = x;
    this.y = y;
    this.updateTransform();
}

hydra.Sprite.prototype.setScaleX = function (scaleX) {
    this.scaleX = scaleX;
    this.updateTransform();
}

hydra.Sprite.prototype.getScaleX = function () {
    return this.scaleX;
}

hydra.Sprite.prototype.setScaleY = function (scaleY) {
    this.scaleY = scaleY;
    this.updateTransform();
}

hydra.Sprite.prototype.getScaleY = function () {
    return this.scaleY;
}

hydra.Sprite.prototype.setScale = function (s) {
    this.scaleX = s;
    this.scaleY = s;
    this.updateTransform();
}

hydra.Sprite.prototype.setRotation = function (rotation) {
    this.rotation = rotation;
    this.updateTransform();
}

hydra.Sprite.prototype.getRotation = function () {
    return this.rotation;
}

hydra.Sprite.prototype.updateTransform = function () {
    this.element.style.WebkitTransform = "translate3d(" + this.x + "px," + this.y + "px,0)" +
        "rotate(" + this.rotation + "deg)" +
        "scale(" + this.scaleX + "," + this.scaleY + ")";
}

/**
 * @param {string} property
 * @param {string} value
 */
hydra.Sprite.prototype.setCss = function (property, value) {
    this.element.style.setProperty(property, value);
}

hydra.Sprite.prototype.pageToLocal = function (pageX, pageY) {
    var global = new WebKitPoint(pageX, pageY);
    return window.webkitConvertPointFromPageToNode(this.element, global);
}

/**
 * @constructor
 * @extends hydra.Sprite
 * @param {Element|hydra.Pool=} source
 */
hydra.Group = function (source) {
    goog.base(this, source);

    /**
     * @private
     * @type {Array.<hydra.Sprite>}
     */
    this.children = [];
}
goog.inherits(hydra.Group, hydra.Sprite);

hydra.Group.div = function (className) {
    var element = document.createElement("div");
    element.className = className;
    return new hydra.Group(element);
}

/**
 * @override
 */
hydra.Group.prototype.activate = function (scene) {
    goog.base(this, "activate", scene);
    for (var ii = 0; ii < this.children.length; ++ii) {
        this.children[ii].activate(scene);
    }
}

/** @override */
hydra.Group.prototype.destroy = function () {
    goog.base(this, "destroy");
    for (var ii = 0; ii < this.children.length; ++ii) {
        var child = this.children[ii];
        child.parent = null;
        child.destroy();
    }
}

/**
 * @param {hydra.Sprite} sprite
 */
hydra.Group.prototype.addSprite = function (sprite) {
    if (this.isActive() && !sprite.isActive()) {
        this.scene.addEntity(sprite, this);
    } else {
        if (sprite.parent != null) {
            sprite.parent.removeSprite(sprite);
        }
        hydra.array.push(this.children, sprite);
        sprite.parent = this;
        this.element.appendChild(sprite.element);
    }
}

/**
 * @param {hydra.Sprite} sprite
 */
hydra.Group.prototype.removeSprite = function (sprite) {
    if (hydra.array.remove(this.children, sprite)) {
        sprite.parent = null;
        sprite.detach();
    }
}

/**
 * @param {hydra.Sprite} sprite
 */
hydra.Group.prototype.contains = function (sprite) {
    return hydra.array.contains(this.children, sprite);
}

hydra.Group.prototype.getChildAt = function (idx) {
    return this.children[idx];
}

hydra.Group.prototype.getChildCount = function () {
    return this.children.length;
}

/**
 * @private
 * @constructor
 * @implements {hydra.Task}
 * @param {string} propName
 * @param {number} duration
 * @param {string} easing
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.NativeTransition = function (propName, duration, easing, spriteOverride) {
    this.propName = propName;
    this.duration = 1000*duration;
    this.easing = easing;
    this.spriteOverride = spriteOverride;

    this.state = hydra.task.NativeTransition.State.RESET;

    /** @type function(number, number, number, number) :number */
    this.interpolator;
}

/**
 * @private
 * @enum {number}
 */
hydra.task.NativeTransition.State = {
    RESET: 0,
    ANIMATING: 1,
    FINISHED: 2
}

/**
 * @param {hydra.Sprite} sprite
 */
hydra.task.NativeTransition.prototype.begin = goog.abstractMethod;

/**
 * @param {hydra.Sprite} sprite
 */
hydra.task.NativeTransition.prototype.progress = function (sprite) { }

hydra.task.NativeTransition.prototype.interpolate = function (from, to) {
    return this.interpolator(this.elapsed, from, to, this.duration);
}

hydra.task.NativeTransition.prototype["handleEvent"] = function (event) {
    if (event["propertyName"] == this.propName) {
        this.state = hydra.task.NativeTransition.State.FINISHED;
        event.target.removeEventListener("webkitTransitionEnd", this, false);
//        console.log("Transition end event");
    }
}

/**
 * @param {hydra.Sprite} sprite
 */
hydra.task.NativeTransition.prototype.update = function (dt, sprite) {
    sprite = this.spriteOverride || sprite;
    switch (this.state) {
        case hydra.task.NativeTransition.State.ANIMATING:
            this.elapsed += dt;
            if (this.elapsed > this.duration) {
                this.elapsed = this.duration;
            }
            this.progress(sprite);
            return false;

        case hydra.task.NativeTransition.State.RESET:
            var computedStyle = window.getComputedStyle(sprite.element, null);
            var oldValue = computedStyle.getPropertyValue(this.propName);

            this.begin(sprite);
            if (oldValue != sprite.element.style.getPropertyValue(this.propName)) {
                this.state = hydra.task.NativeTransition.State.ANIMATING;

                hydra.dom.addTransition(sprite.element.style, this.propName, this.duration + "ms", this.easing);

                // Cast because the compiler doesn't think 'this' is an EventListener
                /** @type object */ var element = sprite.element;
                element.addEventListener("webkitTransitionEnd", this, false);

                /** @private */
                this.elapsed = 0;
                this.progress(sprite);
                return false;

            } else {
                // Property didn't change, bail early. This is actually required, since a
                // transitionend event will never fire in this case.
                return true;
            }

        case hydra.task.NativeTransition.State.FINISHED:
            this.state = hydra.task.NativeTransition.State.RESET;
            hydra.dom.removeTransition(sprite.element.style, this.propName);
            return true;
    }
}

/**
 * @param {!hydra.Sprite} sprite
 */
hydra.task.NativeTransition.prototype.stop = function (sprite) {
    // Interrupt if already stopped
    if (this.state == hydra.task.NativeTransition.State.ANIMATING) {
        sprite = this.spriteOverride || sprite;

        var computedStyle = window.getComputedStyle(sprite.element, null);
        var currentValue = computedStyle.getPropertyValue(this.propName);

        hydra.dom.removeTransition(sprite.element.style, this.propName);

        // Cast because the compiler doesn't think 'this' is an EventListener
        /** @type object */ var element = sprite.element;
        element.removeEventListener("webkitTransitionEnd", this, false);

        sprite.element.style.setProperty(this.propName, currentValue);
    }
}

/**
 * @param {!hydra.Sprite} sprite
 */
hydra.task.NativeTransition.prototype.start = function (sprite) {
    // Resume if previously interrupted
    if (this.state == hydra.task.NativeTransition.State.ANIMATING) {
        sprite = this.spriteOverride || sprite;

        // Same issue?
        var computedStyle = window.getComputedStyle(sprite.element, null);
        var oldValue = computedStyle.getPropertyValue(this.propName);

        this.begin(sprite);
        if (oldValue != sprite.element.style.getPropertyValue(this.propName)) {
            hydra.dom.addTransition(sprite.element.style, this.propName, (this.duration-this.elapsed) + "ms", this.easing);

            // Cast because the compiler doesn't think 'this' is an EventListener
            /** @type object */ var element = sprite.element;
            element.addEventListener("webkitTransitionEnd", this, false);

        } else {
            this.state = hydra.task.NativeTransition.State.FINISHED;
        }
    }
}

hydra.task.NativeTransition.prototype.getDuration = function () {
    return this.duration;
}

hydra.task.NativeTransition.prototype.getElapsed = function () {
    return this.elapsed;
}

hydra.task.NativeTransition.prototype.isComplete = function () {
    return this.state != hydra.task.NativeTransition.State.ANIMATING;
}

/**
 * @constructor
 * @extends hydra.task.NativeTransition
 * @param {string} cssProperty
 * @param {string} value
 * @param {number} duration
 * @param {string} easing
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.AnimateCss = function (cssProperty, value, duration, easing, spriteOverride) {
    goog.base(this, cssProperty, duration, easing, spriteOverride);
    this.value = value;
};
goog.inherits(hydra.task.AnimateCss, hydra.task.NativeTransition);

/**
 * @param {string} cssProperty
 * @param {string} value
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.AnimateCss.linear = function (cssProperty, value, duration, spriteOverride) {
    return new hydra.task.AnimateCss(cssProperty, value, duration, "linear", spriteOverride);
}

/**
 * @param {string} cssProperty
 * @param {string} value
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.AnimateCss.easeIn = function (cssProperty, value, duration, spriteOverride) {
    return new hydra.task.AnimateCss(cssProperty, value, duration, "ease-in", spriteOverride);
}

/** @override */
hydra.task.AnimateCss.prototype.begin = function (sprite) {
    sprite.element.style.setProperty(this.propName, this.value);
}

/**
 * @constructor
 * @extends hydra.task.NativeTransition
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.MoveTo = function (x, y, duration, easing, interpolator, spriteOverride) {
    goog.base(this, "-webkit-transform", duration, easing, spriteOverride);
    this.x = x;
    this.y = y;
    this.interpolator = interpolator;
}
goog.inherits(hydra.task.MoveTo, hydra.task.NativeTransition);

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.MoveTo.linear = function (x, y, duration, spriteOverride) {
    return new hydra.task.MoveTo(x, y, duration, "linear",
        hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.MoveTo.easeIn = function (x, y, duration, spriteOverride) {
    return new hydra.task.MoveTo(x, y, duration, "ease-in",
        hydra.interpolators.INSTANT, spriteOverride); // FIXME: correct interpolator
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.MoveTo.easeOut = function (x, y, duration, spriteOverride) {
    return new hydra.task.MoveTo(x, y, duration, "ease-out",
        hydra.interpolators.INSTANT, spriteOverride); // FIXME: correct interpolator
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.MoveTo.prototype.begin = function (sprite) {
    this.fromX = sprite.x;
    this.fromY = sprite.y;

    sprite.x = this.x;
    sprite.y = this.y;
    sprite.updateTransform();
}

/** @override */
hydra.task.MoveTo.prototype.progress = function (sprite) {
    sprite.x = this.interpolate(this.fromX, this.x);
    sprite.y = this.interpolate(this.fromY, this.y);
}

/**
 * @constructor
 * @extends hydra.task.NativeTransition
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.MoveBy = function (x, y, duration, easing, interpolator, spriteOverride) {
    goog.base(this, "-webkit-transform", duration, easing, spriteOverride);
    this.dx = x;
    this.dy = y;
    this.interpolator = interpolator;
};
goog.inherits(hydra.task.MoveBy, hydra.task.NativeTransition);

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.MoveBy.linear = function (x, y, duration, spriteOverride) {
//    return new hydra.task.MoveBy(x, y, duration, "cubic-bezier(0.2,0.8,0.0,1.0)",
    return new hydra.task.MoveBy(x, y, duration, "linear",
        hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.MoveBy.prototype.begin = function (sprite) {
    this.fromX = sprite.x;
    this.fromY = sprite.y;

    if (this.toX == null) {
        this.toX = this.dx + sprite.x;
        this.toY = this.dy + sprite.y;
    }

    sprite.x = this.toX;
    sprite.y = this.toY;
    sprite.updateTransform();
}

/** @override */
hydra.task.MoveBy.prototype.progress = function (sprite) {
    sprite.x = this.interpolate(this.fromX, this.toX);
    sprite.y = this.interpolate(this.fromY, this.toY);
}

/**
 * @constructor
 * @extends hydra.task.NativeTransition
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.ScaleTo = function (x, y, duration, easing, interpolator, spriteOverride) {
    goog.base(this, "-webkit-transform", duration, easing, spriteOverride);
    this.x = x;
    this.y = y;
    this.interpolator = interpolator;
};
goog.inherits(hydra.task.ScaleTo, hydra.task.NativeTransition);

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.ScaleTo.linear = function (x, y, duration, spriteOverride) {
    return new hydra.task.ScaleTo(x, y, duration, "linear",
        hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.ScaleTo.easeIn = function (x, y, duration, spriteOverride) {
    return new hydra.task.ScaleTo(x, y, duration, "ease-in",
        hydra.interpolators.INSTANT, spriteOverride); // FIXME: Correct interpolator
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.ScaleTo.easeOut = function (x, y, duration, spriteOverride) {
    return new hydra.task.ScaleTo(x, y, duration, "ease-out",
        hydra.interpolators.INSTANT, spriteOverride); // FIXME: Correct interpolator
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.ScaleTo.prototype.begin = function (sprite) {
    this.fromX = sprite.scaleX;
    this.fromY = sprite.scaleY;

    sprite.scaleX = this.x;
    sprite.scaleY = this.y;
    sprite.updateTransform();
}

/** @override */
hydra.task.ScaleTo.prototype.progress = function (sprite) {
    sprite.scaleX = this.interpolate(this.fromX, this.x);
    sprite.scaleY = this.interpolate(this.fromY, this.y);
}

/**
 * @constructor
 * @extends hydra.task.NativeTransition
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.ScaleBy = function (x, y, duration, easing, interpolator, spriteOverride) {
    goog.base(this, "-webkit-transform", duration, easing, spriteOverride);
    this.dx = x;
    this.dy = y;
    this.interpolator = interpolator;
};
goog.inherits(hydra.task.ScaleBy, hydra.task.NativeTransition);

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.ScaleBy.linear = function (x, y, duration, spriteOverride) {
    return new hydra.task.ScaleBy(x, y, duration, "linear",
        hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.ScaleBy.prototype.begin = function (sprite) {
    this.fromX = sprite.scaleX;
    this.fromY = sprite.scaleY;

    sprite.scaleX *= this.dx;
    sprite.scaleY *= this.dy;
    sprite.updateTransform();

    this.toX = sprite.scaleX;
    this.toY = sprite.scaleY;
}

/** @override */
hydra.task.ScaleBy.prototype.progress = function (sprite) {
    sprite.scaleX = this.interpolate(this.fromX, this.toX);
    sprite.scaleY = this.interpolate(this.fromY, this.toY);
}

/**
 * @constructor
 * @extends hydra.task.NativeTransition
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.RotateTo = function (rotation, duration, easing, interpolator, spriteOverride) {
    goog.base(this, "-webkit-transform", duration, easing, spriteOverride);
    this.rotation = rotation;
    this.interpolator = interpolator;
};
goog.inherits(hydra.task.RotateTo, hydra.task.NativeTransition);

/**
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.RotateTo.linear = function (rotation, duration, spriteOverride) {
    return new hydra.task.RotateTo(rotation, duration, "linear",
        hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.RotateTo.prototype.begin = function (sprite) {
    this.from = sprite.rotation;

    sprite.rotation = this.rotation;
    sprite.updateTransform();
}

/** @override */
hydra.task.RotateTo.prototype.progress = function (sprite) {
    sprite.rotation = this.interpolate(this.from, this.rotation);
}

/**
 * @constructor
 * @extends hydra.task.NativeTransition
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.RotateBy = function (rotation, duration, easing, interpolator, spriteOverride) {
    goog.base(this, "-webkit-transform", duration, easing, spriteOverride);
    this.rotation = rotation;
    this.interpolator = interpolator;
};
goog.inherits(hydra.task.RotateBy, hydra.task.NativeTransition);

/**
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.RotateBy.linear = function (rotation, duration, spriteOverride) {
    return new hydra.task.RotateBy(rotation, duration, "linear",
        hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.RotateBy.prototype.begin = function (sprite) {
    this.from = sprite.rotation;

    sprite.rotation += this.rotation;
    sprite.updateTransform();

    this.to = sprite.rotation;
}

/** @override */
hydra.task.RotateBy.prototype.progress = function (sprite) {
    sprite.rotation = this.interpolate(this.from, this.to);
}
