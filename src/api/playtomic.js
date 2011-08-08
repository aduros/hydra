//
// Hydra - HTML5 mobile game engine
// https://github.com/aduros/hydra/blob/master/LICENSE.txt

goog.provide("hydra.api.playtomic");

/**
 * @param {number} swfId
 * @param {string} guid
 */
hydra.api.playtomic.init = function (swfId, guid) {
    try {
        window["Playtomic"]["Log"]["View"](swfId, guid, document.location);
    } catch (_) {
    }
}
