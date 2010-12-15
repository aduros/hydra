goog.provide("hydra.director");
goog.provide("hydra.Entity");
goog.provide("hydra.Scene");
goog.provide("hydra.Task");
goog.provide("hydra.Updatable");

goog.require("hydra.analytics");
goog.require("hydra.array");
goog.require("hydra.Group");
goog.require("hydra.ListenerManager");
goog.require("hydra.platform");

/**
 * @define {string} Unique identifier for this game.
 */
hydra.APP_NAME = "mygame";

/**
 * @private
 * @type {hydra.Scene}
 */
hydra.currentScene;

/**
 * @private
 * @type {Array.<hydra.Scene>}
 */
hydra.scenes = [];

/**
 * @private
 * @type {number}
 */
hydra.lastTime;

/**
 * @private
 * @type {HTMLElement}
 */
hydra.stage = document.getElementById("hydra-stage");

if (goog.DEBUG) {
    var fpsElement = document.getElementById("hydra-fps");
    var fpsTime = 0;
    var fpsFrames = 0;
}

hydra.director.replaceScene = function (scene) {
    var prev = hydra.scenes.pop();
    hydra.array.push(hydra.scenes, scene);
    hydra.currentScene = scene;

    if (prev) {
        prev.exit();
        prev.unload();
    }
    scene.load();
    scene.enter();
}

hydra.director.insertScene = function (scene, idx) {
    if (idx < 0) {
        idx += hydra.scenes.length;
        if (idx < 0) {
            idx = 0;
        }
    } else if (idx > hydra.scenes.length) {
        idx = hydra.scenes.length;
    }

    if (hydra.currentScene && hydra.scenes[idx] == hydra.currentScene) {
        hydra.currentScene.exit();
        hydra.currentScene = scene;
    }
    hydra.scenes.splice(idx, 0, scene);
    scene.load();
    if (hydra.currentScene == scene) {
        scene.enter();
    }
}

hydra.director.unwindToScene = function (scene) {
    if (scene != hydra.currentScene) {
        if (hydra.currentScene) {
            hydra.currentScene.exit();
        }
        for (var ii = hydra.scenes.length-1; ii >= 0; --ii) {
            var s = hydra.scenes[ii];
            if (scene != s) {
                --hydra.scenes.length;
                s.unload();
            } else {
                hydra.currentScene = s;
                scene.enter();
                return;
            }
        }
        hydra.scenes = [scene];
        hydra.currentScene = scene;

        scene.load();
        scene.enter();
    }
}

hydra.director.popScene = function () {
    // Never pop the last scene
    if (hydra.scenes.length > 1) {
        var prev = hydra.scenes.pop();
        prev.exit();
        prev.unload();
        hydra.currentScene = hydra.scenes[hydra.scenes.length-1];
        hydra.currentScene.enter();
    }
}

hydra.director.pushScene = function (scene) {
    if (hydra.currentScene) {
        hydra.currentScene.exit();
    }
    hydra.array.push(hydra.scenes, scene);
    hydra.currentScene = scene;

    scene.load();
    scene.enter();
}

/**
 * @private
 * @param {number} timestamp
 */
hydra.director.tick = function (timestamp) {
    var startTime = hydra.platform.HAS_REQUEST_ANIMATION ? timestamp : Date.now();
    var elapsed = startTime - hydra.lastTime;

    if (goog.DEBUG) {
        ++fpsFrames;
        fpsTime += elapsed;
        if (fpsTime > 1000) {
            var fps = 1000*fpsFrames/fpsTime;
            fpsElement.textContent = "FPS: " + fps.toFixed(2);
            fpsTime = 0;
            fpsFrames = 0;
        }
    }

    hydra.currentScene.update(elapsed);
    hydra.lastTime = startTime;

    if (hydra.platform.HAS_REQUEST_ANIMATION) {
        window[hydra.platform.VENDOR_PREFIX + "RequestAnimationFrame"](hydra.director.tick);
    }
}

hydra.director.init = function (scene) {
    hydra.director.pushScene(scene);

    hydra.lastTime = Date.now();
    if (hydra.platform.HAS_REQUEST_ANIMATION) {
        window[hydra.platform.VENDOR_PREFIX + "RequestAnimationFrame"](hydra.director.tick);
    } else {
        setInterval(hydra.director.tick, 1000/30); // TODO: Tone this down?
    }

//    hydra.director.tick();
}

hydra.director.getCurrentScene = function () {
    return hydra.currentScene;
}

hydra.director.getPreviousScene = function () {
    return hydra.scenes[hydra.scenes.length-2];
}

hydra.director.getStage = function () {
    return hydra.stage;
}

/** @interface */
hydra.Updatable = function () { }

/**
 * @param {number} dt
 * @return {boolean}
 */
hydra.Updatable.prototype.update = function (dt) { }

/**
 * @constructor
 * @implements {hydra.Updatable}
 */
hydra.Entity = function () {
    /**
     * @type {Array.<hydra.Task>}
     * @protected
     */
    this.tasks = [];

    /**
     * @type {hydra.Scene}
     * @protected
     */
    this.scene = null;

    /**
     * @type {hydra.ListenerManager}
     * @protected
     */
    this.listenerManager;
}

/**
 * @param {EventTarget|hydra.EventDispatcher} dispatcher
 * @param {string|number} eventName
 */
hydra.Entity.prototype.registerListener = function (dispatcher, eventName, handler) {
    if (!this.listenerManager) {
        this.listenerManager = new hydra.ListenerManager();
    }
    this.listenerManager.registerListener(dispatcher, eventName, handler);
}

/**
 * @param {EventTarget|hydra.EventDispatcher} dispatcher
 * @param {string|number} eventName
 */
hydra.Entity.prototype.unregisterListener = function (dispatcher, eventName, handler) {
    if (!this.listenerManager) {
        this.listenerManager = new hydra.ListenerManager();
    }
    this.listenerManager.unregisterListener(dispatcher, eventName, handler);
}

hydra.Entity.prototype.unregisterAllListeners = function () {
    if (this.listenerManager) {
        this.listenerManager.unregisterAllListeners();
    }
}

/**
 * @param {hydra.Task} task
 */
hydra.Entity.prototype.addTask = function (task) {
    if (this.tasks.length == 0 && this.scene != null) {
        this.scene.addUpdatable(this);
    }
    hydra.array.push(this.tasks, task);
    task.start(this);
}

/**
 * @param {hydra.Task} task
 */
hydra.Entity.prototype.removeTask = function (task) {
    var idx = this.tasks.indexOf(task);
    if (idx >= 0) {
        task.stop(this);
        // Don't splice it out just yet
        this.tasks[idx] = null;
    }
}

hydra.Entity.prototype.removeAllTasks = function () {
    // Can't simply clear the tasks array, all array splicing must be done in update()
    for (var ii = 0; ii < this.tasks.length; ++ii) {
        var task = this.tasks[ii];
        if (task) {
            task.stop(this);
            this.tasks[ii] = null;
        }
    }
}

hydra.Entity.prototype.activate = function (scene) {
    // TODO: Freak out if already activated?
    this.scene = scene;
    if (this.tasks.length > 0) {
        this.scene.addUpdatable(this);
    }
}

hydra.Entity.prototype.update = function (dt) {
//    for (var ii = 0, ll = this.tasks.length; ii < ll; ++ii) {
    for (var ii = 0; ii < this.tasks.length; ++ii) {
        var task = this.tasks[ii];
        // Task can be null if removeTask was called during iteration
        if (!task || task.update(dt, this)) {
            this.tasks.splice(ii--, 1);
        }
    }
    return (ii == 0);
}

hydra.Entity.prototype.destroy = function () {
    this.removeAllTasks();
    this.unregisterAllListeners();
    if (this.scene != null) {
        this.scene.removeEntity(this);
        this.scene = null;
    }
}

hydra.Entity.prototype.enter = function () {
    for (var ii = 0; ii < this.tasks.length; ++ii) {
        var task = this.tasks[ii];
        if (task) {
            task.start(this);
        }
    }
}

hydra.Entity.prototype.exit = function () {
    for (var ii = 0; ii < this.tasks.length; ++ii) {
        var task = this.tasks[ii];
        if (task) {
            task.stop(this);
        }
    }
}

hydra.Entity.prototype.isActive = function () {
    return (this.scene != null);
}

hydra.Entity.prototype.inCurrentScene = function () {
    return this.scene == hydra.director.getCurrentScene();
}

hydra.Entity.prototype.getScene = function () {
    return this.scene;
}

/** @interface */
hydra.Task = function () { }

/**
 * @param {number} dt
 * @param {!hydra.Entity} entity
 * @return {boolean}
 */
hydra.Task.prototype.update = function (dt, entity) { }

/**
 * @param {!hydra.Entity} entity
 */
hydra.Task.prototype.start = function (entity) { }

/**
 * @param {!hydra.Entity} entity
 */
hydra.Task.prototype.stop = function (entity) { }


/**
 * @constructor
 * @param {string} name
 */
hydra.Scene = function (name) {
    /**
     * @private
     * @type Array.<hydra.Entity>
     */
    this.entities = [];

    /**
     * @private
     * @type Array.<hydra.Updatable>
     */
    this.updatables = [];

    /**
     * @private
     * @type {string}
     */
    this.name = name;

    /**
     * @protected
     * @type {hydra.Group}
     */
    this.root = new hydra.Group(hydra.dom.div("scene scene-" + name));

    this.addEntity(this.root, hydra.director.getStage());
}

hydra.Scene.prototype.update = function (dt) {
    for (var ii = 0; ii < this.updatables.length; ++ii) {
        var updatable = this.updatables[ii];
        if (!updatable || updatable.update(dt)) {
            this.updatables.splice(ii--, 1);
        }
    }
}

/**
 * @param {hydra.Updatable} updatable
 */
hydra.Scene.prototype.addUpdatable = function (updatable) {
    hydra.array.push(this.updatables, updatable);
}

/**
 * @param {hydra.Updatable} updatable
 */
hydra.Scene.prototype.removeUpdatable = function (updatable) {
    var idx = this.updatables.indexOf(updatable);
    if (idx >= 0) {
        this.updatables[idx] = null;
    }
}

/**
 * @param {hydra.Entity} entity
 * @param {hydra.Group|HTMLElement=} parent
 */
// FIXME: Sprites shouldn't be put on the dom until this scene is entered
hydra.Scene.prototype.addEntity = function (entity, parent) {
    // TODO: Figure out once and for all if entities can be reused between scenes
    if (!entity.scene) {
        hydra.array.push(this.entities, entity);
        entity.activate(this);
        if (entity instanceof hydra.Sprite) {
            if (parent instanceof HTMLElement) {
                parent.appendChild(entity.element);
            } else if (parent !== null) {
                parent = parent || this.root;
                parent.addSprite(entity);
            }
        }
    }
}

/**
 * @param {hydra.Entity} entity
 */
hydra.Scene.prototype.removeEntity = function (entity) {
    return hydra.array.remove(this.entities, entity);
}

hydra.Scene.prototype.load = function () {
}

hydra.Scene.prototype.unload = function () {
    for (var ii = 0; ii < this.entities.length; ++ii) {
        var entity = this.entities[ii];
        if (entity.isActive()) {
            entity.scene = null;
            entity.destroy();
        }
    }
    this.entities = [];
    this.updatables = [];
}

hydra.Scene.prototype.enter = function () {
    for (var ii = 0; ii < this.entities.length; ++ii) {
        var entity = this.entities[ii];
        entity.enter();
    }
//    hydra.analytics.trackState(this.name);
}

hydra.Scene.prototype.exit = function () {
    for (var ii = 0; ii < this.entities.length; ++ii) {
        var entity = this.entities[ii];
        entity.exit();
    }
}

hydra.Scene.prototype.registerListener = function (dispatcher, eventName, handler) {
    this.root.registerListener(dispatcher, eventName, handler);
}

hydra.Scene.prototype.unregisterListener = function (dispatcher, eventName, handler) {
    this.root.unregisterListener(dispatcher, eventName, handler);
}

hydra.Scene.prototype.unregisterAllListeners = function () {
    this.root.unregisterAllListeners();
}

hydra.Scene.prototype.addTask = function (task) {
    this.root.addTask(task);
}

hydra.Scene.prototype.removeTask = function (task) {
    this.root.removeTask(task);
}

hydra.Scene.prototype.removeAllTasks = function () {
    this.root.removeAllTasks();
}

hydra.Scene.prototype.isCurrentScene = function () {
    return hydra.director.getCurrentScene() == this;
}

hydra.Scene.prototype.getRoot = function () {
    return this.root;
}
