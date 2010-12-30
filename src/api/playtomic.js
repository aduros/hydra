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
