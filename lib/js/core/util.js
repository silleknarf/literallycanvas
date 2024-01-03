"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.cancelAnimationFrame = exports.requestAnimationFrame = exports.getGUID = exports.getBackingScale = exports.getDefaultImageRect = exports.getBoundingRect = exports.renderShapesToSVG = exports.renderShapes = exports.combineCanvases = exports.matchElementSize = exports.classSet = exports.last = exports.addImageOnload = undefined;

var _canvasRenderer = require("./canvasRenderer");

var _svgRenderer = require("./svgRenderer");

function addImageOnload(img, fn) {
    var oldOnload = img.onload;
    img.onload = function () {
        if (typeof oldOnload === "function") {
            oldOnload();
        }
        fn();
    };
    return img;
}

function last(array) {
    var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (n) {
        return Array.prototype.slice.call(array, Math.max(array.length - n, 0));
    } else {
        return array[array.length - 1];
    }
}

function classSet(classNameToIsPresent) {
    var classNames = [];
    for (var key in classNameToIsPresent) {
        if (classNameToIsPresent[key]) {
            classNames.push(key);
        }
    }
    return classNames.join(" ");
}

function matchElementSize(elementToMatch, elementsToResize, scale, callback) {
    if (callback == null) {
        callback = function callback() {};
    }
    var resize = function resize() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = elementsToResize[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var el = _step.value;

                el.style.width = elementToMatch.offsetWidth + "px";
                el.style.height = elementToMatch.offsetHeight + "px";
                if (el.width != null) {
                    el.setAttribute("width", el.offsetWidth * scale);
                    el.setAttribute("height", el.offsetHeight * scale);
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

        callback();
    };

    elementToMatch.addEventListener("resize", resize);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    resize();
    return resize;
}

function combineCanvases() {
    var c = document.createElement("canvas");

    for (var _len = arguments.length, canvases = Array(_len), _key = 0; _key < _len; _key++) {
        canvases[_key] = arguments[_key];
    }

    c.width = canvases[0].width;
    c.height = canvases[0].height;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = canvases[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var canvas = _step2.value;

            c.width = Math.max(canvas.width, c.width);
            c.height = Math.max(canvas.height, c.height);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    var ctx = c.getContext("2d");

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = canvases[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            canvas = _step3.value;

            ctx.drawImage(canvas, 0, 0);
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return c;
}

function renderShapes(shapes, bounds, scale) {
    var canvas = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    if (scale == null) {
        scale = 1;
    }
    canvas = canvas || document.createElement("canvas");
    canvas.width = bounds.width * scale;
    canvas.height = bounds.height * scale;
    var ctx = canvas.getContext("2d");
    ctx.translate(-bounds.x * scale, -bounds.y * scale);
    ctx.scale(scale, scale);
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = shapes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var shape = _step4.value;

            (0, _canvasRenderer.renderShapeToContext)(ctx, shape);
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    return canvas;
}

function renderShapesToSVG(shapes, _ref, backgroundColor) {
    var x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height;

    return ("<svg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height + "' viewBox='0 0 " + width + " " + height + "'> <rect width='" + width + "' height='" + height + "' x='0' y='0' fill='" + backgroundColor + "' /> <g transform='translate(" + -x + ", " + -y + ")'> " + shapes.map(function (shape) {
        return (0, _svgRenderer.renderShapeToSVG)(shape);
    }).join("") + " </g> </svg>").replace(/(\r\n|\n|\r)/gm, "");
}

// [{x, y, width, height}]
function getBoundingRect(rects, width, height) {
    if (!rects.length) {
        return { x: 0, y: 0, width: 0 || width, height: 0 || height };
    }

    // Calculate the bounds for infinite canvas
    var minX = rects[0].x;
    var minY = rects[0].y;
    var maxX = rects[0].x + rects[0].width;
    var maxY = rects[0].y + rects[0].height;
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = rects[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var rect = _step5.value;

            minX = Math.floor(Math.min(rect.x, minX));
            minY = Math.floor(Math.min(rect.y, minY));
            maxX = Math.ceil(Math.max(maxX, rect.x + rect.width));
            maxY = Math.ceil(Math.max(maxY, rect.y + rect.height));
        }

        // Use the image size bounds if they exist
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }

    minX = width ? 0 : minX;
    minY = height ? 0 : minY;
    maxX = width || maxX;
    maxY = height || maxY;

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Returns the rect LC will use for exporting images using the given params
function getDefaultImageRect(shapeBoundingRects, explicitSize, margin) {
    if (explicitSize == null) {
        explicitSize = { width: 0, height: 0 };
    }
    if (margin == null) {
        margin = { top: 0, right: 0, bottom: 0, left: 0 };
    }
    var _explicitSize = explicitSize,
        width = _explicitSize.width,
        height = _explicitSize.height;

    var rect = getBoundingRect(shapeBoundingRects, width === "infinite" ? 0 : width, height === "infinite" ? 0 : height);

    rect.x -= margin.left;
    rect.y -= margin.top;
    rect.width += margin.left + margin.right;
    rect.height += margin.top + margin.bottom;

    return rect;
}

function getBackingScale(context) {
    if (window.devicePixelRatio == null) {
        return 1;
    }
    if (!(window.devicePixelRatio > 1)) {
        return 1;
    }
    return window.devicePixelRatio;
}

function getGUID() {
    var s4 = function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

function requestAnimationFrame(f) {
    if (window.requestAnimationFrame) {
        return window.requestAnimationFrame(f);
    }
    if (window.webkitRequestAnimationFrame) {
        return window.webkitRequestAnimationFrame(f);
    }
    if (window.mozRequestAnimationFrame) {
        return window.mozRequestAnimationFrame(f);
    }
    return setTimeout(f, 0);
}

function cancelAnimationFrame(f) {
    if (window.cancelAnimationFrame) {
        window.cancelAnimationFrame(f);
    }
    if (window.webkitCancelRequestAnimationFrame) {
        window.webkitCancelRequestAnimationFrame(f);
    }
    if (window.webkitCancelAnimationFrame) {
        window.webkitCancelAnimationFrame(f);
    }
    if (window.mozCancelAnimationFrame) {
        window.mozCancelAnimationFrame(f);
    }
    clearTimeout(f);
}

exports.addImageOnload = addImageOnload;
exports.last = last;
exports.classSet = classSet;
exports.matchElementSize = matchElementSize;
exports.combineCanvases = combineCanvases;
exports.renderShapes = renderShapes;
exports.renderShapesToSVG = renderShapesToSVG;
exports.getBoundingRect = getBoundingRect;
exports.getDefaultImageRect = getDefaultImageRect;
exports.getBackingScale = getBackingScale;
exports.getGUID = getGUID;
exports.requestAnimationFrame = requestAnimationFrame;
exports.cancelAnimationFrame = cancelAnimationFrame;