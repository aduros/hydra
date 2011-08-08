//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.task.CallFunction");
goog.provide("hydra.task.Delay");
goog.provide("hydra.task.Parallel");
goog.provide("hydra.task.Repeat");
goog.provide("hydra.task.SelfDestruct");
goog.provide("hydra.task.Sequence");
goog.provide("hydra.task.SetCss");

goog.require("hydra.array");
goog.require("hydra.Task");

/**
 * @constructor
 * @implements {hydra.Task}
 */
hydra.task.CallFunction = function (fn) {
    /** @type {function(number,!hydra.Entity)} */
    this.fn = fn;
//    this.args = arguments;
}

hydra.task.CallFunction.prototype.start = function (entity) { }

hydra.task.CallFunction.prototype.stop = function (entity) { }

hydra.task.CallFunction.prototype.update = function (dt, entity) {
    this.fn(dt, entity);
    return true;
}

/**
 * @constructor
 * @implements {hydra.Task}
 */
hydra.task.Delay = function (delay) {
    /**
     * @type {number}
     */
    this.delay = 1000*delay;

    /**
     * @private
     * @type {number}
     */
    this.elapsed = 0;
}

/**
 * @inline
 */
hydra.task.Delay.prototype.setDelay = function (delay) {
    this.delay = 1000*delay;
}

/**
 * @inline
 */
hydra.task.Delay.prototype.getDelay = function () {
    return this.delay / 1000;
}

hydra.task.Delay.prototype.start = function (entity) { }

hydra.task.Delay.prototype.stop = function (entity) { }

hydra.task.Delay.prototype.update = function (dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.delay) {
        this.elapsed = 0;
        return true;
    } else {
        return false;
    }
}

/**
 * @constructor
 * @implements {hydra.Task}
 */
hydra.task.Parallel = function (tasks) {
    /**
     * @private
     * @type {Array.<hydra.Task>}
     */
    this.tasks = tasks;

    /**
     * @private
     * @type {Array.<hydra.Task>}
     */
    this.completedTasks = [];
}

hydra.task.Parallel.prototype.stop = function (entity) {
    for (var ii = 0; ii < this.tasks.length; ++ii) {
        var task = this.tasks[ii];
        if (task) {
            task.stop(entity);
        }
    }
}

hydra.task.Parallel.prototype.start = function (entity) {
    for (var ii = 0; ii < this.tasks.length; ++ii) {
        var task = this.tasks[ii];
        if (task) {
            task.start(entity);
        }
    }
}

hydra.task.Parallel.prototype.update = function (dt, entity) {
    for (var ii = 0; ii < this.tasks.length; ++ii) {
        var task = this.tasks[ii];
        if (task && task.update(dt, entity)) {
            this.tasks[ii] = null;
            hydra.array.push(this.completedTasks, task);
        }
    }
    if (this.completedTasks.length == this.tasks.length) {
        this.tasks = this.completedTasks;
        this.completedTasks = [];
        return true;
    } else {
        return false;
    }
}

/**
 * @constructor
 * @implements {hydra.Task}
 */
hydra.task.Repeat = function (task) {
    /**
     * @private
     * @type {hydra.Task}
     */
    this.task = task;
}

hydra.task.Repeat.prototype.stop = function (entity) {
    this.task.stop(entity);
}

hydra.task.Repeat.prototype.start = function (entity) {
    this.task.start(entity);
}

hydra.task.Repeat.prototype.update = function (dt, element) {
    this.task.update(dt, element);
    return false;
}

/**
 * @constructor
 * @implements {hydra.Task}
 */
hydra.task.SelfDestruct = function () {
}

hydra.task.SelfDestruct.prototype.start = function (entity) { }

hydra.task.SelfDestruct.prototype.stop = function (entity) { }

hydra.task.SelfDestruct.prototype.update = function (dt, entity) {
    entity.destroy();
    return true;
}

/**
 * @constructor
 * @implements {hydra.Task}
 */
hydra.task.Sequence = function (tasks) {
    /** @type {Array.<hydra.Task>} */
    this.tasks = tasks;
    this.idx = 0;
}

hydra.task.Sequence.prototype.stop = function (entity) {
    if (this.idx < this.tasks.length) {
        var task = this.tasks[this.idx];
        task.stop(entity);
    }
}

hydra.task.Sequence.prototype.start = function (entity) {
    if (this.idx < this.tasks.length) {
        this.tasks[this.idx].start(entity);
    }
}

hydra.task.Sequence.prototype.update = function (dt, entity) {
    // FIXME: Handle empty this.tasks
    if (this.tasks[this.idx].update(dt, entity)) {
        if (++this.idx < this.tasks.length) {
            // TODO: Should call start() on the next task?
            this.tasks[this.idx].start(entity);
            return false;
        } else {
            this.idx = 0;
            return true;
        }
    } else {
        return false;
    }
}

/**
 * @constructor
 * @param {hydra.Sprite=} entityOverride
 * @implements {hydra.Task}
 */
hydra.task.SetCss = function (propName, value, entityOverride) {
    this.propName = propName;
    this.value = value;
    this.entityOverride = entityOverride;
}

hydra.task.SetCss.prototype.start = function (entity) { }

hydra.task.SetCss.prototype.stop = function (entity) { }

hydra.task.SetCss.prototype.update = function (dt, entity) {
    entity = this.entityOverride || entity;
    entity.element.style.setProperty(this.propName, this.value);
    return true;
}
