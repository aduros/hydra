goog.provide("hydra.sound");
goog.provide("hydra.task.PlaySound");
goog.provide("hydra.Music");

// TODO: Audio element pooling
/**
 * @param {string} src
 * @return {HTMLAudioElement}
 */
hydra.sound.play = function (src) {
    var audio = /** @type {HTMLAudioElement} */ (document.createElement("audio"));
    audio.src = src;
    audio.load(); // iPhone doesn't autoplay
    audio.play();
    return audio;
}

/**
 * @constructor
 * @implements {hydra.Task}
 * @param {string} src
 * @param {boolean=} blocking
 */
hydra.task.PlaySound = function (src, blocking) {
    this.src = src;
    this.blocking = blocking;
}

hydra.task.PlaySound.prototype.stop = function (entity) {
    this.audio.pause();
}

hydra.task.PlaySound.prototype.start = function (entity) {
    if (this.audio) {
        this.audio.play();
    } else {
        this.audio = hydra.sound.play(this.src);
    }
}

hydra.task.PlaySound.prototype.update = function (dt, entity) {
    if (this.blocking && !this.audio.ended) {
        return false;
    } else {
        this.audio = null;
        return true;
    }
}

/**
 * @constructor
 * @extends hydra.Entity
 * @param {string} src
 */
hydra.Music = function (src) {
    goog.base(this);
    this.audio = document.createElement("audio");
    // audio.loop does not work on iOS
    this.audio.addEventListener("ended", HTMLAudioElement.prototype.play, false);
//    this.audio.loop = true;
    this.audio.autoplay = false;
    this.audio.src = src;
    this.audio.load();

    /**
     * @private
     */
    this.enabled = true;
}
goog.inherits(hydra.Music, hydra.Entity);

/**
 * @override
 */
hydra.Music.prototype.destroy = function () {
    goog.base(this, "destroy");
    this.audio.pause();
    this.audio = null;
}

/**
 * @override
 */
hydra.Music.prototype.exit = function () {
    goog.base(this, "exit");
    this.audio.pause();
}

/**
 * @override
 */
hydra.Music.prototype.enter = function () {
    goog.base(this, "enter");
    if (this.enabled) {
        this.audio.play();
    }
}

hydra.Music.prototype.setEnabled = function (enabled) {
    if (enabled && !this.enabled) {
        this.audio.play();
    } else if (!enabled && this.enabled) {
        this.audio.pause();
    }
    this.enabled = enabled;
}
