"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderShapeToContext = exports.renderShapeToCanvas = exports.defineCanvasRenderer = undefined;

var _lineEndCapShapes = require("./lineEndCapShapes");

var _lineEndCapShapes2 = _interopRequireDefault(_lineEndCapShapes);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var renderers = {};

// drawFunc(ctx, shape, retryCallback)
// drawLatest(ctx, bufferCtx, shape, retryCallback)
var defineCanvasRenderer = function defineCanvasRenderer(shapeName, drawFunc, drawLatestFunc) {
    return renderers[shapeName] = { drawFunc: drawFunc, drawLatestFunc: drawLatestFunc };
};

var noop = function noop() {};
var renderShapeToContext = function renderShapeToContext(ctx, shape, opts) {
    if (opts == null) {
        opts = {};
    }
    if (opts.shouldIgnoreUnsupportedShapes == null) {
        opts.shouldIgnoreUnsupportedShapes = false;
    }
    if (opts.retryCallback == null) {
        opts.retryCallback = noop;
    }
    if (opts.shouldOnlyDrawLatest == null) {
        opts.shouldOnlyDrawLatest = false;
    }
    if (opts.bufferCtx == null) {
        opts.bufferCtx = null;
    }
    var _opts = opts,
        bufferCtx = _opts.bufferCtx;

    if (renderers[shape.className]) {
        if (opts.shouldOnlyDrawLatest && renderers[shape.className].drawLatestFunc) {
            renderers[shape.className].drawLatestFunc(ctx, bufferCtx, shape, opts.retryCallback);
        } else {
            renderers[shape.className].drawFunc(ctx, shape, opts.retryCallback);
        }
    } else if (opts.shouldIgnoreUnsupportedShapes) {
        console.warn("Can't render shape of type " + shape.className + " to canvas");
    } else {
        throw "Can't render shape of type " + shape.className + " to canvas";
    }
};

var renderShapeToCanvas = function renderShapeToCanvas(canvas, shape, opts) {
    return renderShapeToContext(canvas.getContext("2d"), shape, opts);
};

defineCanvasRenderer("Rectangle", function (ctx, shape) {
    var x = shape.x;
    var y = shape.y;

    if (shape.strokeWidth % 2 !== 0) {
        x += 0.5;
        y += 0.5;
    }

    ctx.fillStyle = shape.fillColor;
    ctx.fillRect(x, y, shape.width, shape.height);
    ctx.lineWidth = shape.strokeWidth;
    ctx.strokeStyle = shape.strokeColor;
    ctx.strokeRect(x, y, shape.width, shape.height);
});

defineCanvasRenderer("Ellipse", function (ctx, shape) {
    ctx.save();
    var halfWidth = Math.floor(shape.width / 2);
    var halfHeight = Math.floor(shape.height / 2);
    var centerX = shape.x + halfWidth;
    var centerY = shape.y + halfHeight;

    ctx.translate(centerX, centerY);
    ctx.scale(1, Math.abs(shape.height / shape.width));
    ctx.beginPath();
    ctx.arc(0, 0, Math.abs(halfWidth), 0, Math.PI * 2);
    ctx.closePath();
    ctx.restore();

    ctx.fillStyle = shape.fillColor;
    ctx.fill();
    ctx.lineWidth = shape.strokeWidth;
    ctx.strokeStyle = shape.strokeColor;
    ctx.stroke();
});

defineCanvasRenderer("SelectionBox", function () {
    var _drawHandle = function _drawHandle(ctx, _ref, handleSize) {
        var x = _ref.x,
            y = _ref.y;

        if (handleSize === 0) {
            return;
        }

        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, handleSize, handleSize);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(x, y, handleSize, handleSize);
    };

    return function (ctx, shape) {
        _drawHandle(ctx, shape.getTopLeftHandleRect(), shape.handleSize);
        _drawHandle(ctx, shape.getTopRightHandleRect(), shape.handleSize);
        _drawHandle(ctx, shape.getBottomLeftHandleRect(), shape.handleSize);
        _drawHandle(ctx, shape.getBottomRightHandleRect(), shape.handleSize);

        if (shape.backgroundColor) {
            ctx.fillStyle = shape.backgroundColor;
            ctx.fillRect(shape._br.x - shape.margin, shape._br.y - shape.margin, shape._br.width + shape.margin * 2, shape._br.height + shape.margin * 2);
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = shape.backgroundColor || "#000";
        ctx.setLineDash([2, 4]);
        ctx.strokeRect(shape._br.x - shape.margin, shape._br.y - shape.margin, shape._br.width + shape.margin * 2, shape._br.height + shape.margin * 2);

        ctx.setLineDash([]);
    };
}());

defineCanvasRenderer("Image", function (ctx, shape, retryCallback) {
    if (shape.image.width) {
        if (shape.scale === 1) {
            ctx.drawImage(shape.image, shape.x, shape.y);
        } else {
            return ctx.drawImage(shape.image, shape.x, shape.y, shape.image.width * shape.scale, shape.image.height * shape.scale);
        }
    } else if (retryCallback) {
        shape.image.onload = retryCallback;
    }
});

defineCanvasRenderer("Line", function (ctx, shape) {
    if (shape.x1 === shape.x2 && shape.y1 === shape.y2) {
        // browser behavior is not consistent for this case.
        return;
    }

    var x1 = shape.x1;
    var x2 = shape.x2;
    var y1 = shape.y1;
    var y2 = shape.y2;

    if (shape.strokeWidth % 2 !== 0) {
        x1 += 0.5;
        x2 += 0.5;
        y1 += 0.5;
        y2 += 0.5;
    }

    ctx.lineWidth = shape.strokeWidth;
    ctx.strokeStyle = shape.color;
    ctx.lineCap = shape.capStyle;
    if (shape.dash) {
        ctx.setLineDash(shape.dash);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    if (shape.dash) {
        ctx.setLineDash([]);
    }

    var arrowWidth = Math.max(shape.strokeWidth * 2.2, 5);
    if (shape.endCapShapes[0]) {
        _lineEndCapShapes2.default[shape.endCapShapes[0]].drawToCanvas(ctx, x1, y1, Math.atan2(y1 - y2, x1 - x2), arrowWidth, shape.color);
    }
    if (shape.endCapShapes[1]) {
        _lineEndCapShapes2.default[shape.endCapShapes[1]].drawToCanvas(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1), arrowWidth, shape.color);
    }
});

var _drawRawLinePath = function _drawRawLinePath(ctx, points, close, lineCap) {
    if (close == null) {
        close = false;
    }
    if (lineCap == null) {
        lineCap = "round";
    }
    if (!points.length) {
        return;
    }

    ctx.lineCap = lineCap;

    ctx.strokeStyle = points[0].color;
    ctx.lineWidth = points[0].size;

    ctx.beginPath();

    if (points[0].size % 2 === 0) {
        ctx.moveTo(points[0].x, points[0].y);
    } else {
        ctx.moveTo(points[0].x + 0.5, points[0].y + 0.5);
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = points.slice(1)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var point = _step.value;

            if (points[0].size % 2 === 0) {
                ctx.lineTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x + 0.5, point.y + 0.5);
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    if (close) {
        ctx.closePath();
    }
};

var drawLinePath = function drawLinePath(ctx, shape) {
    _drawRawLinePath(ctx, shape.smoothedPoints);
    ctx.stroke();
};
var drawLinePathLatest = function drawLinePathLatest(ctx, bufferCtx, shape) {
    if (shape.tail) {
        var segmentStart = shape.smoothedPoints.length - shape.segmentSize * shape.tailSize;
        var drawStart = segmentStart < shape.segmentSize * 2 ? 0 : segmentStart;

        var drawEnd = segmentStart + shape.segmentSize + 1;

        _drawRawLinePath(bufferCtx, shape.smoothedPoints.slice(drawStart, drawEnd));
        bufferCtx.stroke();
    } else {
        _drawRawLinePath(bufferCtx, shape.smoothedPoints);
        bufferCtx.stroke();
    }
};

defineCanvasRenderer("LinePath", drawLinePath, drawLinePathLatest);

// same as the line path funcs, but erase instead of draw
var drawErasedLinePath = function drawErasedLinePath(ctx, shape) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    drawLinePath(ctx, shape);
    ctx.restore();
};
var drawErasedLinePathLatest = function drawErasedLinePathLatest(ctx, bufferCtx, shape) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    bufferCtx.save();
    bufferCtx.globalCompositeOperation = "destination-out";

    drawLinePathLatest(ctx, bufferCtx, shape);

    ctx.restore();
    bufferCtx.restore();
};

defineCanvasRenderer("ErasedLinePath", drawErasedLinePath, drawErasedLinePathLatest);

defineCanvasRenderer("Text", function (ctx, shape) {
    if (!shape.renderer) {
        shape._makeRenderer(ctx);
    }
    ctx.fillStyle = shape.color;
    shape.renderer.draw(ctx, shape.x, shape.y);
});

defineCanvasRenderer("Polygon", function (ctx, shape) {
    ctx.fillStyle = shape.fillColor;
    _drawRawLinePath(ctx, shape.points, shape.isClosed, "butt");
    ctx.fill();
    ctx.stroke();
});

exports.defineCanvasRenderer = defineCanvasRenderer;
exports.renderShapeToCanvas = renderShapeToCanvas;
exports.renderShapeToContext = renderShapeToContext;