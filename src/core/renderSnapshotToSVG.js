"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require("./util");

var _shapes = require("./shapes");

var INFINITE = "infinite";

var renderSnapshotToSVG = function renderSnapshotToSVG(snapshot, opts) {
    if (opts == null) {
        opts = {};
    }
    var shapes = snapshot.shapes.map(function (s) {
        return (0, _shapes.JSONToShape)(s);
    });
    var backgroundShapes = snapshot.backgroundShapes.map(function (s) {
        return (0, _shapes.JSONToShape)(s);
    });

    if (opts.margin == null) {
        opts.margin = { top: 0, right: 0, bottom: 0, left: 0 };
    }
    var imageSize = snapshot.imageSize || {
        width: INFINITE,
        height: INFINITE
    };

    var colors = snapshot.colors || { background: "transparent" };
    var allShapes = shapes.concat(backgroundShapes);

    var dummyCanvas = document.createElement("canvas");
    var ctx = dummyCanvas.getContext("2d");

    if (opts.rect) {
        opts.rect.x -= opts.margin.left;
        opts.rect.y -= opts.margin.top;
        opts.rect.width += opts.margin.left + opts.margin.right;
        opts.rect.height += opts.margin.top + opts.margin.bottom;
    } else {
        opts.rect = (0, _util.getDefaultImageRect)(allShapes.map(function (s) {
            return s.getBoundingRect(ctx);
        }), imageSize, opts.margin);
    }

    return (0, _util.renderShapesToSVG)(backgroundShapes.concat(shapes), opts.rect, colors.background);
};

exports.default = renderSnapshotToSVG;