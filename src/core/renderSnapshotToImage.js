"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require("./util");

var _shapes = require("./shapes");

// mostly copypasta from LiterallyCanvas.coffee
var INFINITE = "infinite";
var renderWatermark = function renderWatermark(ctx, image, scale) {
    if (!image.width) {
        return;
    }

    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
};

var renderSnapshotToImage = function renderSnapshotToImage(snapshot, opts) {
    var s = void 0;
    if (opts == null) {
        opts = {};
    }
    if (opts.scale == null) {
        opts.scale = 1;
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

    var watermarkCanvas = document.createElement("canvas");
    var watermarkCtx = watermarkCanvas.getContext("2d");

    if (opts.rect) {
        opts.rect.x -= opts.margin.left;
        opts.rect.y -= opts.margin.top;
        opts.rect.width += opts.margin.left + opts.margin.right;
        opts.rect.height += opts.margin.top + opts.margin.bottom;
    } else {
        opts.rect = (0, _util.getDefaultImageRect)(allShapes.map(function (s) {
            return s.getBoundingRect(watermarkCtx);
        }), imageSize, opts.margin);
    }

    watermarkCanvas.width = opts.rect.width * opts.scale;
    watermarkCanvas.height = opts.rect.height * opts.scale;
    watermarkCtx.fillStyle = colors.background;
    watermarkCtx.fillRect(0, 0, watermarkCanvas.width, watermarkCanvas.height);

    if (!(opts.rect.width && opts.rect.height)) {
        return null;
    }

    if (opts.watermarkImage) {
        renderWatermark(watermarkCtx, opts.watermarkImage, opts.watermarkScale);
    }

    return (0, _util.combineCanvases)(watermarkCanvas, (0, _util.renderShapes)(backgroundShapes, opts.rect, opts.scale), (0, _util.renderShapes)(shapes, opts.rect, opts.scale));
};

exports.default = renderSnapshotToImage;