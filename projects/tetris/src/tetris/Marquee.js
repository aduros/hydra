//
// Block Dream - HTML5 mobile game built with Hydra
// https://github.com/aduros/hydra/blob/master/projects/LICENSE.txt

goog.provide("tetris.Marquee");

/**
 * @constructor
 * @extends {hydra.Group}
 */
tetris.Marquee = function () {
    goog.base(this, hydra.dom.div("marquee"));

    this.label = new hydra.Sprite(hydra.dom.div("marquee-text"));
    this.addSprite(this.label);
    this.setCss("opacity", "0");
}
goog.inherits(tetris.Marquee, hydra.Group);

tetris.Marquee.prototype.setText = function (text) {
    this.removeAllTasks();
    this.label.setX(200);
    this.label.element.innerHTML = text;

    // Wait for offsetWidth...
    var self = this;
    setTimeout(function () { 
        var w = self.label.element.offsetWidth;
        self.addTask(new hydra.task.Sequence([
            hydra.task.StyleTo.linear("opacity", "1", 0.5),
            hydra.task.MoveTo.linear(-w, 0, (w+200)/100, self.label),
            hydra.task.StyleTo.linear("opacity", "0", 0.5)
        ]));
    }, 0);
}
