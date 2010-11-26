goog.provide("hydra.Sprite");
goog.provide("hydra.Group");

// These tasks use CSS transitions if available, and as such are privy to the performance benefits,
// especially on iOS. Unfortunately, multiple CSS transitions are unable to act on the same style
// at once, such as the 'transform' style. This means we can't have a MoveTo transition on a sprite
// while it is being rotated or scaled with RotateTo or ScaleTo. Bummer. If you want a sprite to
// transform multiple ways at once, explicitly use the "Basic" family of tasks which use old school
// Javascript animation. Basic tasks are always used anyways if CSS transitions are not supported
// on this platform.
goog.provide("hydra.task.StyleTo");
goog.provide("hydra.task.MoveTo");
goog.provide("hydra.task.MoveBy");
goog.provide("hydra.task.ScaleTo");
goog.provide("hydra.task.ScaleBy");
goog.provide("hydra.task.RotateTo");
goog.provide("hydra.task.RotateBy");

goog.provide("hydra.task.BasicStyleTo");
goog.provide("hydra.task.BasicMoveTo");
goog.provide("hydra.task.BasicMoveBy");
goog.provide("hydra.task.BasicScaleTo");
goog.provide("hydra.task.BasicScaleBy");
goog.provide("hydra.task.BasicRotateTo");
goog.provide("hydra.task.BasicRotateBy");

goog.require("hydra.dom");
goog.require("hydra.interpolators");
goog.require("hydra.array");
//goog.require("hydra.Entity");
goog.require("hydra.dom");
goog.require("hydra.platform");

/**
 * @constructor
 * @extends hydra.Entity
 * @param {Element=} element
 */
hydra.Sprite = function (element) {
    goog.base(this);

    /**
     * //@protected
     * @type {HTMLElement}
     */
    this.element = /** @type {HTMLElement} */ (element || document.createElement("div"));

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

/**
 * @param {string} className
 */
hydra.Sprite.div = function (className) {
    var sprite = new hydra.Sprite();
    sprite.element.className = className;
    return sprite;
}

hydra.Sprite.prototype.detach = function () {
    if (this.parent) {
        this.parent.removeSprite(this);

    } else if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
    }
}

/** @override */
hydra.Sprite.prototype.destroy = function () {
    goog.base(this, "destroy");

    this.detach();
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

hydra.Sprite.prototype.setScaleXY = function (x, y) {
    this.scaleX = x;
    this.scaleY = y;
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
    if (hydra.platform.HAS_TRANSLATE3D) {
        // translate3d is a hint for hardware acceleration
        this.element.style[hydra.platform.VENDOR_PREFIX + "Transform"] =
            "translate3d(" + this.x + "px," + this.y + "px,0)" +
            "rotate(" + this.rotation + "deg)" +
            "scale(" + this.scaleX + "," + this.scaleY + ")";
    } else {
        this.element.style.setProperty(hydra.platform.prefixCss("transform"),
            "translate(" + this.x + "px," + this.y + "px)" +
            "rotate(" + this.rotation + "deg)" +
            "scale(" + this.scaleX + "," + this.scaleY + ")", "");
    }
}

/**
 * @param {string} property
 * @param {string} value
 */
hydra.Sprite.prototype.setCss = function (property, value) {
    this.element.style.setProperty(property, value, "");
}

/**
 * @param {number} pageX
 * @param {number} pageY
 * @return {WebKitPoint}
 */
hydra.Sprite.prototype.pageToLocal = function (pageX, pageY) {
    if (hydra.platform.IS_WEBKIT) {
        var global = new WebKitPoint(pageX, pageY);
        return window.webkitConvertPointFromPageToNode(this.element, global);
    } else {
        throw new Error("pageToLocal is not yet supported on this target");
    }
}

/**
 * @constructor
 * @extends hydra.Sprite
 * @param {Element=} element
 */
hydra.Group = function (element) {
    goog.base(this, element);

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
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 * @param {function(number, number, number, number) :number} interpolator
 */
hydra.task.BasicAnimation = function (duration, interpolator, spriteOverride) {
    this.duration = 1000*duration;
    this.interpolator = interpolator;
    this.spriteOverride = spriteOverride;
    this.elapsed = 0;
}

/**
 * @param {hydra.Sprite} sprite
 * @protected
 */
hydra.task.BasicAnimation.prototype.progress = function (sprite) { }

/**
 * @param {hydra.Sprite} sprite
 * @protected
 */
hydra.task.BasicAnimation.prototype.begin = function (sprite) { }

hydra.task.BasicAnimation.prototype.interpolate = function (from, to) {
    return this.interpolator(this.elapsed, from, to, this.duration);
}

/**
 * @param {hydra.Sprite} sprite
 */
hydra.task.BasicAnimation.prototype.update = function (dt, sprite) {
    sprite = this.spriteOverride || sprite;
    if (!this.elapsed) {
        this.begin(sprite);
    }
    this.elapsed += dt;
    if (this.elapsed > this.duration) {
        this.elapsed = this.duration;
    }
    this.progress(sprite);
    if (this.elapsed >= this.duration) {
        this.elapsed = 0;
        return true;
    } else {
        return false;
    }
}

/**
 * @param {!hydra.Sprite} sprite
 */
hydra.task.BasicAnimation.prototype.stop = function (sprite) { }

/**
 * @param {!hydra.Sprite} sprite
 */
hydra.task.BasicAnimation.prototype.start = function (sprite) { }

hydra.task.BasicAnimation.prototype.getDuration = function () {
    return this.duration;
}

hydra.task.BasicAnimation.prototype.getElapsed = function () {
    return this.elapsed;
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
hydra.task.TransitionAnimation = function (propName, duration, easing, spriteOverride) {
    this.propName = propName;
    this.duration = 1000*duration;
    this.easing = easing;
    this.spriteOverride = spriteOverride;

    this.state = hydra.task.TransitionAnimation.State.RESET;

    /** @type function(number, number, number, number) :number */
    this.interpolator;
}

/**
 * @private
 * @enum {number}
 */
hydra.task.TransitionAnimation.State = {
    RESET: 0,
    ANIMATING: 1,
    FINISHED: 2
}

/**
 * @param {hydra.Sprite} sprite
 * @protected
 */
hydra.task.TransitionAnimation.prototype.begin = goog.abstractMethod;

/**
 * @param {hydra.Sprite} sprite
 * @protected
 */
hydra.task.TransitionAnimation.prototype.progress = function (sprite) { }

hydra.task.TransitionAnimation.prototype.interpolate = function (from, to) {
    return this.interpolator(this.elapsed, from, to, this.duration);
}

hydra.task.TransitionAnimation.prototype["handleEvent"] = function (event) {
    if (event["propertyName"] == this.propName) {
        this.state = hydra.task.TransitionAnimation.State.FINISHED;
        event.target.removeEventListener(hydra.platform.IS_FF4 ?
            "transitionend" : hydra.platform.VENDOR_PREFIX + "TransitionEnd", this, false);
    }
}

/**
 * @param {hydra.Sprite} sprite
 */
hydra.task.TransitionAnimation.prototype.update = function (dt, sprite) {
    sprite = this.spriteOverride || sprite;
    switch (this.state) {
        case hydra.task.TransitionAnimation.State.ANIMATING:
            this.elapsed += dt;
            if (this.elapsed > this.duration) {
                this.elapsed = this.duration;
            }
            this.progress(sprite);
            return false;

        case hydra.task.TransitionAnimation.State.RESET:
            var computedStyle = window.getComputedStyle(sprite.element, null);
            var oldValue = computedStyle.getPropertyValue(this.propName);

            this.begin(sprite);
            if (oldValue != sprite.element.style.getPropertyValue(this.propName)) {
                this.state = hydra.task.TransitionAnimation.State.ANIMATING;

                hydra.dom.addTransition(sprite.element.style, this.propName, this.duration + "ms", this.easing);

                // Cast because the compiler doesn't think 'this' is an EventListener
                /** @type object */ var element = sprite.element;
                element.addEventListener(hydra.platform.IS_FF4 ?
                    "transitionend" : hydra.platform.VENDOR_PREFIX + "TransitionEnd", this, false);

                /** @private */
                this.elapsed = 0;
                this.progress(sprite);
                return false;

            } else {
                // Property didn't change, bail early. This is actually required, since a
                // transitionend event will never fire in this case.
                return true;
            }

        case hydra.task.TransitionAnimation.State.FINISHED:
            this.state = hydra.task.TransitionAnimation.State.RESET;
            hydra.dom.removeTransition(sprite.element.style, this.propName);
            return true;
    }
}

/**
 * @param {!hydra.Sprite} sprite
 */
hydra.task.TransitionAnimation.prototype.stop = function (sprite) {
    // Interrupt if already stopped
    if (this.state == hydra.task.TransitionAnimation.State.ANIMATING) {
        sprite = this.spriteOverride || sprite;

        var computedStyle = window.getComputedStyle(sprite.element, null);
        var currentValue = computedStyle.getPropertyValue(this.propName);

        hydra.dom.removeTransition(sprite.element.style, this.propName);

        // Cast because the compiler doesn't think 'this' is an EventListener
        /** @type object */ var element = sprite.element;
        element.removeEventListener(hydra.platform.IS_FF4 ?
            "transitionend" : hydra.platform.VENDOR_PREFIX + "TransitionEnd", this, false);

        sprite.element.style.setProperty(this.propName, currentValue, "");
    }
}

/**
 * @param {!hydra.Sprite} sprite
 */
hydra.task.TransitionAnimation.prototype.start = function (sprite) {
    // Resume if previously interrupted
    if (this.state == hydra.task.TransitionAnimation.State.ANIMATING) {
        sprite = this.spriteOverride || sprite;

        // Same issue?
        var computedStyle = window.getComputedStyle(sprite.element, null);
        var oldValue = computedStyle.getPropertyValue(this.propName);

        this.begin(sprite);
        if (oldValue != sprite.element.style.getPropertyValue(this.propName)) {
            hydra.dom.addTransition(sprite.element.style, this.propName, (this.duration-this.elapsed) + "ms", this.easing);

            // Cast because the compiler doesn't think 'this' is an EventListener
            /** @type object */ var element = sprite.element;
            element.addEventListener(hydra.platform.IS_FF4 ?
                "transitionend" : hydra.platform.VENDOR_PREFIX + "TransitionEnd", this, false);

        } else {
            this.state = hydra.task.TransitionAnimation.State.FINISHED;
        }
    }
}

hydra.task.TransitionAnimation.prototype.getDuration = function () {
    return this.duration;
}

hydra.task.TransitionAnimation.prototype.getElapsed = function () {
    return this.elapsed;
}

hydra.task.TransitionAnimation.prototype.isComplete = function () {
    return this.state != hydra.task.TransitionAnimation.State.ANIMATING;
}

if (hydra.platform.HAS_CSS_TRANSITIONS) {
    /**
     * @constructor
     * @extends hydra.task.TransitionAnimation
     * @param {string} cssProperty
     * @param {string} value
     * @param {number} duration
     * @param {string} easing
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionStyleTo = function (cssProperty, value, duration, easing, spriteOverride) {
        goog.base(this, cssProperty, duration, easing, spriteOverride);
        this.value = value;
    };
    goog.inherits(hydra.task.TransitionStyleTo, hydra.task.TransitionAnimation);

    /**
     * @param {string} cssProperty
     * @param {string} value
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionStyleTo.linear = function (cssProperty, value, duration, spriteOverride) {
        return new hydra.task.TransitionStyleTo(cssProperty, value, duration, "linear", spriteOverride);
    }

    /**
     * @param {string} cssProperty
     * @param {string} value
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionStyleTo.easeIn = function (cssProperty, value, duration, spriteOverride) {
        return new hydra.task.TransitionStyleTo(cssProperty, value, duration, "ease-in", spriteOverride);
    }

    /**
     * @param {string} cssProperty
     * @param {string} value
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionStyleTo.easeOut = function (cssProperty, value, duration, spriteOverride) {
        return new hydra.task.TransitionStyleTo(cssProperty, value, duration, "ease-out", spriteOverride);
    }

    /** @override */
    hydra.task.TransitionStyleTo.prototype.begin = function (sprite) {
        sprite.element.style.setProperty(this.propName, this.value, "");
    }

    /**
     * @constructor
     * @extends hydra.task.TransitionAnimation
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionMoveTo = function (x, y, duration, easing, interpolator, spriteOverride) {
        goog.base(this, hydra.platform.prefixCss("transform"), duration, easing, spriteOverride);
        this.x = x;
        this.y = y;
        this.interpolator = interpolator;
    }
    goog.inherits(hydra.task.TransitionMoveTo, hydra.task.TransitionAnimation);

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionMoveTo.linear = function (x, y, duration, spriteOverride) {
        return new hydra.task.TransitionMoveTo(x, y, duration, "linear",
            hydra.interpolators.LINEAR, spriteOverride);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionMoveTo.easeIn = function (x, y, duration, spriteOverride) {
        return new hydra.task.TransitionMoveTo(x, y, duration, "ease-in",
            hydra.interpolators.EASE_IN, spriteOverride);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionMoveTo.easeOut = function (x, y, duration, spriteOverride) {
        return new hydra.task.TransitionMoveTo(x, y, duration, "ease-out",
            hydra.interpolators.EASE_OUT, spriteOverride);
    }

    /**
     * @override
     * @param {hydra.Sprite} sprite
     */
    hydra.task.TransitionMoveTo.prototype.begin = function (sprite) {
        this.fromX = sprite.x;
        this.fromY = sprite.y;

        sprite.x = this.x;
        sprite.y = this.y;
        sprite.updateTransform();
    }

    /** @override */
    hydra.task.TransitionMoveTo.prototype.progress = function (sprite) {
        sprite.x = this.interpolate(this.fromX, this.x);
        sprite.y = this.interpolate(this.fromY, this.y);
    }

    /**
     * @constructor
     * @extends hydra.task.TransitionAnimation
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionMoveBy = function (x, y, duration, easing, interpolator, spriteOverride) {
        goog.base(this, hydra.platform.prefixCss("transform"), duration, easing, spriteOverride);
        this.dx = x;
        this.dy = y;
        this.interpolator = interpolator;
    }
    goog.inherits(hydra.task.TransitionMoveBy, hydra.task.TransitionAnimation);

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionMoveBy.linear = function (x, y, duration, spriteOverride) {
    //    return new hydra.task.TransitionMoveBy(x, y, duration, "cubic-bezier(0.2,0.8,0.0,1.0)",
        return new hydra.task.TransitionMoveBy(x, y, duration, "linear",
            hydra.interpolators.LINEAR, spriteOverride);
    }

    /**
     * @override
     * @param {hydra.Sprite} sprite
     */
    hydra.task.TransitionMoveBy.prototype.begin = function (sprite) {
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
    hydra.task.TransitionMoveBy.prototype.progress = function (sprite) {
        sprite.x = this.interpolate(this.fromX, this.toX);
        sprite.y = this.interpolate(this.fromY, this.toY);
    }

    /**
     * @constructor
     * @extends hydra.task.TransitionAnimation
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionScaleTo = function (x, y, duration, easing, interpolator, spriteOverride) {
        goog.base(this, hydra.platform.prefixCss("transform"), duration, easing, spriteOverride);
        this.x = x;
        this.y = y;
        this.interpolator = interpolator;
    };
    goog.inherits(hydra.task.TransitionScaleTo, hydra.task.TransitionAnimation);

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionScaleTo.linear = function (x, y, duration, spriteOverride) {
        return new hydra.task.TransitionScaleTo(x, y, duration, "linear",
            hydra.interpolators.LINEAR, spriteOverride);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionScaleTo.easeIn = function (x, y, duration, spriteOverride) {
        return new hydra.task.TransitionScaleTo(x, y, duration, "ease-in",
            hydra.interpolators.EASE_IN, spriteOverride);
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionScaleTo.easeOut = function (x, y, duration, spriteOverride) {
        return new hydra.task.TransitionScaleTo(x, y, duration, "ease-out",
            hydra.interpolators.EASE_OUT, spriteOverride);
    }

    /**
     * @override
     * @param {hydra.Sprite} sprite
     */
    hydra.task.TransitionScaleTo.prototype.begin = function (sprite) {
        this.fromX = sprite.scaleX;
        this.fromY = sprite.scaleY;

        sprite.scaleX = this.x;
        sprite.scaleY = this.y;
        sprite.updateTransform();
    }

    /** @override */
    hydra.task.TransitionScaleTo.prototype.progress = function (sprite) {
        sprite.scaleX = this.interpolate(this.fromX, this.x);
        sprite.scaleY = this.interpolate(this.fromY, this.y);
    }

    /**
     * @constructor
     * @extends hydra.task.TransitionAnimation
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionScaleBy = function (x, y, duration, easing, interpolator, spriteOverride) {
        goog.base(this, hydra.platform.prefixCss("transform"), duration, easing, spriteOverride);
        this.dx = x;
        this.dy = y;
        this.interpolator = interpolator;
    };
    goog.inherits(hydra.task.TransitionScaleBy, hydra.task.TransitionAnimation);

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionScaleBy.linear = function (x, y, duration, spriteOverride) {
        return new hydra.task.TransitionScaleBy(x, y, duration, "linear",
            hydra.interpolators.LINEAR, spriteOverride);
    }

    /**
     * @override
     * @param {hydra.Sprite} sprite
     */
    hydra.task.TransitionScaleBy.prototype.begin = function (sprite) {
        this.fromX = sprite.scaleX;
        this.fromY = sprite.scaleY;

        sprite.scaleX *= this.dx;
        sprite.scaleY *= this.dy;
        sprite.updateTransform();

        this.toX = sprite.scaleX;
        this.toY = sprite.scaleY;
    }

    /** @override */
    hydra.task.TransitionScaleBy.prototype.progress = function (sprite) {
        sprite.scaleX = this.interpolate(this.fromX, this.toX);
        sprite.scaleY = this.interpolate(this.fromY, this.toY);
    }

    /**
     * @constructor
     * @extends hydra.task.TransitionAnimation
     * @param {number} rotation
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionRotateTo = function (rotation, duration, easing, interpolator, spriteOverride) {
        goog.base(this, hydra.platform.prefixCss("transform"), duration, easing, spriteOverride);
        this.rotation = rotation;
        this.interpolator = interpolator;
    };
    goog.inherits(hydra.task.TransitionRotateTo, hydra.task.TransitionAnimation);

    /**
     * @param {number} rotation
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionRotateTo.linear = function (rotation, duration, spriteOverride) {
        return new hydra.task.TransitionRotateTo(rotation, duration, "linear",
            hydra.interpolators.LINEAR, spriteOverride);
    }

    /**
     * @override
     * @param {hydra.Sprite} sprite
     */
    hydra.task.TransitionRotateTo.prototype.begin = function (sprite) {
        this.from = sprite.rotation;

        sprite.rotation = this.rotation;
        sprite.updateTransform();
    }

    /** @override */
    hydra.task.TransitionRotateTo.prototype.progress = function (sprite) {
        sprite.rotation = this.interpolate(this.from, this.rotation);
    }

    /**
     * @constructor
     * @extends hydra.task.TransitionAnimation
     * @param {number} rotation
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionRotateBy = function (rotation, duration, easing, interpolator, spriteOverride) {
        goog.base(this, hydra.platform.prefixCss("transform"), duration, easing, spriteOverride);
        this.rotation = rotation;
        this.interpolator = interpolator;
    };
    goog.inherits(hydra.task.TransitionRotateBy, hydra.task.TransitionAnimation);

    /**
     * @param {number} rotation
     * @param {number} duration
     * @param {hydra.Sprite=} spriteOverride
     */
    hydra.task.TransitionRotateBy.linear = function (rotation, duration, spriteOverride) {
        return new hydra.task.TransitionRotateBy(rotation, duration, "linear",
            hydra.interpolators.LINEAR, spriteOverride);
    }

    /**
     * @override
     * @param {hydra.Sprite} sprite
     */
    hydra.task.TransitionRotateBy.prototype.begin = function (sprite) {
        this.from = sprite.rotation;

        sprite.rotation += this.rotation;
        sprite.updateTransform();

        this.to = sprite.rotation;
    }

    /** @override */
    hydra.task.TransitionRotateBy.prototype.progress = function (sprite) {
        sprite.rotation = this.interpolate(this.from, this.to);
    }

}

/**
 * @constructor
 * @extends hydra.task.BasicAnimation
 * @param {string} cssProperty
 * @param {string} value
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicStyleTo = function (cssProperty, value, duration, interpolator, spriteOverride) {
    goog.base(this, duration, interpolator, spriteOverride);
    this.cssProperty = cssProperty;
    this.value = parseFloat(value); // TODO: Make this handle units such as px or %
}
goog.inherits(hydra.task.BasicStyleTo, hydra.task.BasicAnimation);

/**
 * @param {string} cssProperty
 * @param {string} value
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicStyleTo.linear = function (cssProperty, value, duration, spriteOverride) {
    return new hydra.task.BasicStyleTo(cssProperty, value, duration,
        hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @param {string} cssProperty
 * @param {string} value
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicStyleTo.easeIn = function (cssProperty, value, duration, spriteOverride) {
    return new hydra.task.BasicStyleTo(cssProperty, value, duration,
        hydra.interpolators.EASE_IN, spriteOverride);
}

/**
 * @param {string} cssProperty
 * @param {string} value
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicStyleTo.easeOut = function (cssProperty, value, duration, spriteOverride) {
    return new hydra.task.BasicStyleTo(cssProperty, value, duration,
        hydra.interpolators.EASE_OUT, spriteOverride);
}

/**
 * @override
 */
hydra.task.BasicStyleTo.prototype.begin = function (sprite) {
    var computedStyle = window.getComputedStyle(sprite.element, null);
    this.fromValue = parseFloat(computedStyle.getPropertyValue(this.cssProperty));
}

/** @override */
hydra.task.BasicStyleTo.prototype.progress = function (sprite) {
    sprite.element.style.setProperty(this.cssProperty,
        this.interpolate(this.fromValue, this.value), "");
}

/**
 * @constructor
 * @extends hydra.task.BasicAnimation
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicMoveTo = function (x, y, duration, interpolator, spriteOverride) {
    goog.base(this, duration, interpolator, spriteOverride);
    this.x = x;
    this.y = y;
}
goog.inherits(hydra.task.BasicMoveTo, hydra.task.BasicAnimation);

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicMoveTo.linear = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicMoveTo(x, y, duration, hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicMoveTo.easeIn = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicMoveTo(x, y, duration, hydra.interpolators.EASE_IN, spriteOverride);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicMoveTo.easeOut = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicMoveTo(x, y, duration, hydra.interpolators.EASE_OUT, spriteOverride);
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.BasicMoveTo.prototype.begin = function (sprite) {
    this.fromX = sprite.getX();
    this.fromY = sprite.getY();
}

/** @override */
hydra.task.BasicMoveTo.prototype.progress = function (sprite) {
    sprite.setXY(
        this.interpolate(this.fromX, this.x),
        this.interpolate(this.fromY, this.y));
}

/**
 * @constructor
 * @extends hydra.task.BasicAnimation
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicMoveBy = function (x, y, duration, interpolator, spriteOverride) {
    goog.base(this, duration, interpolator, spriteOverride);
    this.x = x;
    this.y = y;
}
goog.inherits(hydra.task.BasicMoveBy, hydra.task.BasicAnimation);

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicMoveBy.linear = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicMoveBy(x, y, duration, hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicMoveBy.easeIn = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicMoveBy(x, y, duration, hydra.interpolators.EASE_IN, spriteOverride);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicMoveBy.easeOut = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicMoveBy(x, y, duration, hydra.interpolators.EASE_OUT, spriteOverride);
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.BasicMoveBy.prototype.begin = function (sprite) {
    this.fromX = sprite.getX();
    this.fromY = sprite.getY();
}

/** @override */
hydra.task.BasicMoveBy.prototype.progress = function (sprite) {
    sprite.setXY(
        this.interpolate(this.fromX, this.fromX+this.x),
        this.interpolate(this.fromY, this.fromY+this.y));
}

/**
 * @constructor
 * @extends hydra.task.BasicAnimation
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicRotateTo = function (rotation, duration, interpolator, spriteOverride) {
    goog.base(this, duration, interpolator, spriteOverride);
    this.rotation = rotation;
}
goog.inherits(hydra.task.BasicRotateTo, hydra.task.BasicAnimation);

/**
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicRotateTo.linear = function (rotation, duration, spriteOverride) {
    return new hydra.task.BasicRotateTo(rotation, duration, hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicRotateTo.easeIn = function (rotation, duration, spriteOverride) {
    return new hydra.task.BasicRotateTo(rotation, duration, hydra.interpolators.EASE_IN, spriteOverride);
}

/**
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicRotateTo.easeOut = function (rotation, duration, spriteOverride) {
    return new hydra.task.BasicRotateTo(rotation, duration, hydra.interpolators.EASE_OUT, spriteOverride);
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.BasicRotateTo.prototype.begin = function (sprite) {
    this.from = sprite.getRotation();
}

/** @override */
hydra.task.BasicRotateTo.prototype.progress = function (sprite) {
    sprite.setRotation(this.interpolate(this.from, this.rotation));
}

/**
 * @constructor
 * @extends hydra.task.BasicAnimation
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicRotateBy = function (rotation, duration, interpolator, spriteOverride) {
    goog.base(this, duration, interpolator, spriteOverride);
    this.rotation = rotation;
}
goog.inherits(hydra.task.BasicRotateBy, hydra.task.BasicAnimation);

/**
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicRotateBy.linear = function (rotation, duration, spriteOverride) {
    return new hydra.task.BasicRotateBy(rotation, duration, hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicRotateBy.easeIn = function (rotation, duration, spriteOverride) {
    return new hydra.task.BasicRotateBy(rotation, duration, hydra.interpolators.EASE_IN, spriteOverride);
}

/**
 * @param {number} rotation
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicRotateBy.easeOut = function (rotation, duration, spriteOverride) {
    return new hydra.task.BasicRotateBy(rotation, duration, hydra.interpolators.EASE_OUT, spriteOverride);
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.BasicRotateBy.prototype.begin = function (sprite) {
    this.from = sprite.getRotation();
}

/** @override */
hydra.task.BasicRotateBy.prototype.progress = function (sprite) {
    sprite.setRotation(this.interpolate(this.from, this.from+this.rotation));
}

/**
 * @constructor
 * @extends hydra.task.BasicAnimation
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicScaleTo = function (x, y, duration, interpolator, spriteOverride) {
    goog.base(this, duration, interpolator, spriteOverride);
    this.x = x;
    this.y = y;
}
goog.inherits(hydra.task.BasicScaleTo, hydra.task.BasicAnimation);

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicScaleTo.linear = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicScaleTo(x, y, duration, hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicScaleTo.easeIn = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicScaleTo(x, y, duration, hydra.interpolators.EASE_IN, spriteOverride);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicScaleTo.easeOut = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicScaleTo(x, y, duration, hydra.interpolators.EASE_OUT, spriteOverride);
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.BasicScaleTo.prototype.begin = function (sprite) {
    this.fromX = sprite.getScaleX();
    this.fromY = sprite.getScaleY();
}

/** @override */
hydra.task.BasicScaleTo.prototype.progress = function (sprite) {
    sprite.setScaleXY(
        this.interpolate(this.fromX, this.x),
        this.interpolate(this.fromY, this.y));
}

/**
 * @constructor
 * @extends hydra.task.BasicAnimation
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicScaleBy = function (x, y, duration, interpolator, spriteOverride) {
    goog.base(this, duration, interpolator, spriteOverride);
    this.x = x;
    this.y = y;
}
goog.inherits(hydra.task.BasicScaleBy, hydra.task.BasicAnimation);

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicScaleBy.linear = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicScaleBy(x, y, duration, hydra.interpolators.LINEAR, spriteOverride);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicScaleBy.easeIn = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicScaleBy(x, y, duration, hydra.interpolators.EASE_IN, spriteOverride);
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @param {hydra.Sprite=} spriteOverride
 */
hydra.task.BasicScaleBy.easeOut = function (x, y, duration, spriteOverride) {
    return new hydra.task.BasicScaleBy(x, y, duration, hydra.interpolators.EASE_OUT, spriteOverride);
}

/**
 * @override
 * @param {hydra.Sprite} sprite
 */
hydra.task.BasicScaleBy.prototype.begin = function (sprite) {
    this.fromX = sprite.getScaleX();
    this.fromY = sprite.getScaleY();
}

/** @override */
hydra.task.BasicScaleBy.prototype.progress = function (sprite) {
    sprite.setScaleXY(
        this.interpolate(this.fromX, this.fromX+this.x),
        this.interpolate(this.fromY, this.fromY+this.y));
}

// If this platform has CSS transitions, use it for the standard styles, otherwise use the basic
// transitions which are done with js.
if (hydra.platform.HAS_CSS_TRANSITIONS) {
    hydra.task.StyleTo.linear = hydra.task.TransitionStyleTo.linear;
    hydra.task.StyleTo.easeIn = hydra.task.TransitionStyleTo.easeIn;
    hydra.task.StyleTo.easeOut = hydra.task.TransitionStyleTo.easeOut;
    hydra.task.MoveTo.linear = hydra.task.TransitionMoveTo.linear;
    hydra.task.MoveTo.easeIn = hydra.task.TransitionMoveTo.easeIn;
    hydra.task.MoveTo.easeOut = hydra.task.TransitionMoveTo.easeOut;
    hydra.task.MoveBy.linear = hydra.task.TransitionMoveBy.linear;
    hydra.task.MoveBy.easeIn = hydra.task.TransitionMoveBy.easeIn;
    hydra.task.MoveBy.easeOut = hydra.task.TransitionMoveBy.easeOut;
    hydra.task.RotateTo.linear = hydra.task.TransitionRotateTo.linear;
    hydra.task.RotateTo.easeIn = hydra.task.TransitionRotateTo.easeIn;
    hydra.task.RotateTo.easeOut = hydra.task.TransitionRotateTo.easeOut;
    hydra.task.RotateBy.linear = hydra.task.TransitionRotateBy.linear;
    hydra.task.RotateBy.easeIn = hydra.task.TransitionRotateBy.easeIn;
    hydra.task.RotateBy.easeOut = hydra.task.TransitionRotateBy.easeOut;
    hydra.task.ScaleTo.linear = hydra.task.TransitionScaleTo.linear;
    hydra.task.ScaleTo.easeIn = hydra.task.TransitionScaleTo.easeIn;
    hydra.task.ScaleTo.easeOut = hydra.task.TransitionScaleTo.easeOut;
    hydra.task.ScaleBy.linear = hydra.task.TransitionScaleBy.linear;
    hydra.task.ScaleBy.easeIn = hydra.task.TransitionScaleBy.easeIn;
    hydra.task.ScaleBy.easeOut = hydra.task.TransitionScaleBy.easeOut;
} else {
    hydra.task.StyleTo.linear = hydra.task.BasicStyleTo.linear;
    hydra.task.StyleTo.easeIn = hydra.task.BasicStyleTo.easeIn;
    hydra.task.StyleTo.easeOut = hydra.task.BasicStyleTo.easeOut;
    hydra.task.MoveTo.linear = hydra.task.BasicMoveTo.linear;
    hydra.task.MoveTo.easeIn = hydra.task.BasicMoveTo.easeIn;
    hydra.task.MoveTo.easeOut = hydra.task.BasicMoveTo.easeOut;
    hydra.task.MoveBy.linear = hydra.task.BasicMoveBy.linear;
    hydra.task.MoveBy.easeIn = hydra.task.BasicMoveBy.easeIn;
    hydra.task.MoveBy.easeOut = hydra.task.BasicMoveBy.easeOut;
    hydra.task.RotateTo.linear = hydra.task.BasicRotateTo.linear;
    hydra.task.RotateTo.easeIn = hydra.task.BasicRotateTo.easeIn;
    hydra.task.RotateTo.easeOut = hydra.task.BasicRotateTo.easeOut;
    hydra.task.RotateBy.linear = hydra.task.BasicRotateBy.linear;
    hydra.task.RotateBy.easeIn = hydra.task.BasicRotateBy.easeIn;
    hydra.task.RotateBy.easeOut = hydra.task.BasicRotateBy.easeOut;
    hydra.task.ScaleTo.linear = hydra.task.BasicScaleTo.linear;
    hydra.task.ScaleTo.easeIn = hydra.task.BasicScaleTo.easeIn;
    hydra.task.ScaleTo.easeOut = hydra.task.BasicScaleTo.easeOut;
    hydra.task.ScaleBy.linear = hydra.task.BasicScaleBy.linear;
    hydra.task.ScaleBy.easeIn = hydra.task.BasicScaleBy.easeIn;
    hydra.task.ScaleBy.easeOut = hydra.task.BasicScaleBy.easeOut;
}
