"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.shapeToJSON = exports.JSONToShape = exports.createShape = exports.defineShape = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * decaffeinate suggestions:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * DS201: Simplify complex destructure assignments
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

var _util = require("./util");

var _TextRenderer = require("./TextRenderer");

var _TextRenderer2 = _interopRequireDefault(_TextRenderer);

var _canvasRenderer = require("./canvasRenderer");

var _svgRenderer = require("./svgRenderer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var shapes = {};

var defineShape = function defineShape(name, props) {
    // improve Chrome JIT perf by not using arguments object
    var Shape = function Shape(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
        props.constructor.call(this, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
        return this;
    };
    Shape.prototype.className = name;
    Shape.fromJSON = props.fromJSON;

    // support old style of defining canvas drawing methods on shapes
    if (props.draw) {
        var legacyDrawFunc = props.draw;
        var legacyDrawLatestFunc = props.draw || function (ctx, bufferCtx, retryCallback) {
            this.draw(ctx, bufferCtx, retryCallback);
        };
        var drawFunc = function drawFunc(ctx, shape, retryCallback) {
            return legacyDrawFunc.call(shape, ctx, retryCallback);
        };
        var drawLatestFunc = function drawLatestFunc(ctx, bufferCtx, shape, retryCallback) {
            return legacyDrawLatestFunc.call(shape, ctx, bufferCtx, retryCallback);
        };
        delete props.draw;
        if (props.drawLatest) {
            delete props.drawLatest;
        }

        (0, _canvasRenderer.defineCanvasRenderer)(name, drawFunc, drawLatestFunc);
    }

    // support old style of defining SVG drawing methods on shapes
    if (props.toSVG) {
        var legacySVGFunc = props.toSVG;
        var svgFunc = function svgFunc(shape) {
            return legacySVGFunc.call(shape);
        };
        delete props.toSVG;
        (0, _svgRenderer.defineSVGRenderer)(name, svgFunc);
    }

    Shape.prototype.draw = function (ctx, retryCallback) {
        (0, _canvasRenderer.renderShapeToContext)(ctx, this, { retryCallback: retryCallback });
    };
    Shape.prototype.drawLatest = function (ctx, bufferCtx, retryCallback) {
        (0, _canvasRenderer.renderShapeToContext)(ctx, this, {
            retryCallback: retryCallback,
            bufferCtx: bufferCtx,
            shouldOnlyDrawLatest: true
        });
    };
    Shape.prototype.toSVG = function () {
        (0, _svgRenderer.renderShapeToSVG)(this);
    };

    for (var k in props) {
        if (k !== "fromJSON") {
            Shape.prototype[k] = props[k];
        }
    }

    shapes[name] = Shape;
    return Shape;
};

// improve Chrome JIT perf by not using arguments object
var createShape = function createShape(name, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    var s = new shapes[name](a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
    s.id = (0, _util.getGUID)();
    return s;
};

var JSONToShape = function JSONToShape(_ref) {
    var className = _ref.className,
        data = _ref.data,
        id = _ref.id;

    if (className in shapes) {
        var shape = shapes[className].fromJSON(data);
        if (shape) {
            if (id) {
                shape.id = id;
            }
            return shape;
        } else {
            console.log("Unreadable shape:", className, data);
            return null;
        }
    } else {
        console.log("Unknown shape:", className, data);
        return null;
    }
};

var shapeToJSON = function shapeToJSON(shape) {
    return {
        className: shape.className,
        data: shape.toJSON(),
        id: shape.id
    };
};

// this fn depends on Point, but LinePathShape depends on it, so it can't be
// moved out of this file yet.
var bspline = function bspline(points, order) {
    if (!order) {
        return points;
    }
    return bspline(_dual(_dual(_refine(points))), order - 1);
};

var _refine = function _refine(points) {
    points = [points[0]].concat(points).concat((0, _util.last)(points));
    var refined = [];

    var index = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = points[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var point = _step.value;

            refined[index * 2] = point;
            if (points[index + 1]) {
                refined[index * 2 + 1] = _mid(point, points[index + 1]);
            }
            index += 1;
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

    return refined;
};

var _dual = function _dual(points) {
    var dualed = [];

    var index = 0;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = points[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var point = _step2.value;

            if (points[index + 1]) {
                dualed[index] = _mid(point, points[index + 1]);
            }
            index += 1;
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

    return dualed;
};

var _mid = function _mid(a, b) {
    return createShape("Point", {
        x: a.x + (b.x - a.x) / 2,
        y: a.y + (b.y - a.y) / 2,
        size: a.size + (b.size - a.size) / 2,
        color: a.color
    });
};

defineShape("Image", {
    // TODO: allow resizing/filling
    constructor: function constructor(args) {
        if (args == null) {
            args = {};
        }
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.scale = args.scale || 1;
        this.image = args.image || null;
        this.crossOrigin = args.image && args.image.crossOrigin || null;
    },
    getBoundingRect: function getBoundingRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.image.width * this.scale,
            height: this.image.height * this.scale
        };
    },
    toJSON: function toJSON() {
        var toJSONData = {
            x: this.x,
            y: this.y,
            imageSrc: this.image.src,
            imageObject: this.image,
            scale: this.scale
        };
        if (this.crossOrigin) {
            toJSONData["crossOrigin"] = this.crossOrigin;
        }
        return toJSONData;
    },
    fromJSON: function fromJSON(data) {
        var img = null;
        if (data.imageObject != null ? data.imageObject.width : undefined) {
            img = data.imageObject;
        } else {
            img = new Image();
            img.src = data.imageSrc;
            if (data.crossOrigin) {
                img.crossOrigin = data.crossOrigin;
            }
        }
        return createShape("Image", {
            x: data.x,
            y: data.y,
            image: img,
            scale: data.scale
        });
    },
    move: function move(moveInfo) {
        if (moveInfo == null) {
            moveInfo = {};
        }
        this.x = this.x - moveInfo.xDiff;
        this.y = this.y - moveInfo.yDiff;
    },
    setUpperLeft: function setUpperLeft(upperLeft) {
        if (upperLeft == null) {
            upperLeft = {};
        }
        this.x = upperLeft.x;
        this.y = upperLeft.y;
    }
});

defineShape("Rectangle", {
    constructor: function constructor(args) {
        if (args == null) {
            args = {};
        }
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.width = args.width || 0;
        this.height = args.height || 0;
        this.strokeWidth = args.strokeWidth || 1;
        this.strokeColor = args.strokeColor || "black";
        this.fillColor = args.fillColor || "transparent";
    },
    getBoundingRect: function getBoundingRect() {
        return {
            x: this.x - this.strokeWidth / 2,
            y: this.y - this.strokeWidth / 2,
            width: this.width + this.strokeWidth,
            height: this.height + this.strokeWidth
        };
    },
    toJSON: function toJSON() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            strokeWidth: this.strokeWidth,
            strokeColor: this.strokeColor,
            fillColor: this.fillColor
        };
    },
    fromJSON: function fromJSON(data) {
        return createShape("Rectangle", data);
    },
    move: function move(moveInfo) {
        if (moveInfo == null) {
            moveInfo = {};
        }
        this.x = this.x - moveInfo.xDiff;
        this.y = this.y - moveInfo.yDiff;
    },
    setUpperLeft: function setUpperLeft(upperLeft) {
        if (upperLeft == null) {
            upperLeft = {};
        }
        this.x = upperLeft.x;
        this.y = upperLeft.y;
    }
});

// this is pretty similar to the Rectangle shape. maybe consolidate somehow.
defineShape("Ellipse", {
    constructor: function constructor(args) {
        if (args == null) {
            args = {};
        }
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.width = args.width || 0;
        this.height = args.height || 0;
        this.strokeWidth = args.strokeWidth || 1;
        this.strokeColor = args.strokeColor || "black";
        this.fillColor = args.fillColor || "transparent";
    },
    getBoundingRect: function getBoundingRect() {
        return {
            x: this.x - this.strokeWidth / 2,
            y: this.y - this.strokeWidth / 2,
            width: this.width + this.strokeWidth,
            height: this.height + this.strokeWidth
        };
    },
    toJSON: function toJSON() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            strokeWidth: this.strokeWidth,
            strokeColor: this.strokeColor,
            fillColor: this.fillColor
        };
    },
    fromJSON: function fromJSON(data) {
        return createShape("Ellipse", data);
    },
    move: function move(moveInfo) {
        if (moveInfo == null) {
            moveInfo = {};
        }
        this.x = this.x - moveInfo.xDiff;
        this.y = this.y - moveInfo.yDiff;
    },
    setUpperLeft: function setUpperLeft(upperLeft) {
        if (upperLeft == null) {
            upperLeft = {};
        }
        this.x = upperLeft.x;
        this.y = upperLeft.y;
    }
});

defineShape("Line", {
    constructor: function constructor(args) {
        if (args == null) {
            args = {};
        }
        this.x1 = args.x1 || 0;
        this.y1 = args.y1 || 0;
        this.x2 = args.x2 || 0;
        this.y2 = args.y2 || 0;
        this.strokeWidth = args.strokeWidth || 1;
        this.color = args.color || "black";
        this.capStyle = args.capStyle || "round";
        this.endCapShapes = args.endCapShapes || [null, null];
        this.dash = args.dash || null;
    },
    getBoundingRect: function getBoundingRect() {
        return {
            x: Math.min(this.x1, this.x2) - this.strokeWidth / 2,
            y: Math.min(this.y1, this.y2) - this.strokeWidth / 2,
            width: Math.abs(this.x2 - this.x1) + this.strokeWidth / 2,
            height: Math.abs(this.y2 - this.y1) + this.strokeWidth / 2
        };
    },
    toJSON: function toJSON() {
        return {
            x1: this.x1,
            y1: this.y1,
            x2: this.x2,
            y2: this.y2,
            strokeWidth: this.strokeWidth,
            color: this.color,
            capStyle: this.capStyle,
            dash: this.dash,
            endCapShapes: this.endCapShapes
        };
    },
    fromJSON: function fromJSON(data) {
        return createShape("Line", data);
    },
    move: function move(moveInfo) {
        if (moveInfo == null) {
            moveInfo = {};
        }
        this.x1 = this.x1 - moveInfo.xDiff;
        this.y1 = this.y1 - moveInfo.yDiff;
        this.x2 = this.x2 - moveInfo.xDiff;
        this.y2 = this.y2 - moveInfo.yDiff;
    },
    setUpperLeft: function setUpperLeft(upperLeft) {
        if (upperLeft == null) {
            upperLeft = {};
        }
        var br = this.getBoundingRect();
        var xDiff = br.x - upperLeft.x;
        var yDiff = br.y - upperLeft.y;
        this.move({ xDiff: xDiff, yDiff: yDiff });
    }
});

// returns false if no points because there are no points to share style
var _doAllPointsShareStyle = function _doAllPointsShareStyle(points) {
    if (!points.length) {
        return false;
    }
    var size = points[0].size;
    var color = points[0].color;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = points[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var point = _step3.value;

            if (point.size !== size || point.color !== color) {
                console.log(size, color, point.size, point.color);
            }
            if (point.size !== size || point.color !== color) {
                return false;
            }
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

    return true;
};

var _createLinePathFromData = function _createLinePathFromData(shapeName, data) {
    var x = void 0,
        y = void 0;
    var points = null;
    if (data.points) {
        points = data.points.map(function (pointData) {
            return JSONToShape(pointData);
        });
    } else if (data.pointCoordinatePairs) {
        points = data.pointCoordinatePairs.map(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2),
                x = _ref3[0],
                y = _ref3[1];

            return JSONToShape({
                className: "Point",
                data: {
                    x: x,
                    y: y,
                    size: data.pointSize,
                    color: data.pointColor,
                    smooth: data.smooth
                }
            });
        });
    }

    var smoothedPoints = null;
    if (data.smoothedPointCoordinatePairs) {
        smoothedPoints = data.smoothedPointCoordinatePairs.map(function (_ref4) {
            var _ref5 = _slicedToArray(_ref4, 2),
                x = _ref5[0],
                y = _ref5[1];

            return JSONToShape({
                className: "Point",
                data: {
                    x: x,
                    y: y,
                    size: data.pointSize,
                    color: data.pointColor,
                    smooth: data.smooth
                }
            });
        });
    }

    if (!points[0]) {
        return null;
    }
    return createShape(shapeName, {
        points: points,
        smoothedPoints: smoothedPoints,
        order: data.order,
        tailSize: data.tailSize,
        smooth: data.smooth
    });
};

var linePathFuncs = {
    constructor: function constructor(args) {
        var _this = this;

        if (args == null) {
            args = {};
        }
        var points = args.points || [];
        this.order = args.order || 3;
        this.tailSize = args.tailSize || 3;
        this.smooth = "smooth" in args ? args.smooth : true;

        // The number of smoothed points generated for each point added
        this.segmentSize = Math.pow(2, this.order);

        // The number of points used to calculate the bspline to the newest point
        this.sampleSize = this.tailSize + 1;

        if (args.smoothedPoints) {
            this.points = args.points;
            this.smoothedPoints = args.smoothedPoints;
        } else {
            this.points = [];
            points.map(function (point) {
                return _this.addPoint(point);
            });
        }
    },
    getBoundingRect: function getBoundingRect() {
        return (0, _util.getBoundingRect)(this.points.map(function (p) {
            return {
                x: p.x - p.size / 2,
                y: p.y - p.size / 2,
                width: p.size,
                height: p.size
            };
        }));
    },
    toJSON: function toJSON() {
        if (_doAllPointsShareStyle(this.points)) {
            return {
                order: this.order,
                tailSize: this.tailSize,
                smooth: this.smooth,
                pointCoordinatePairs: this.points.map(function (point) {
                    return [point.x, point.y];
                }),
                smoothedPointCoordinatePairs: this.smoothedPoints.map(function (point) {
                    return [point.x, point.y];
                }),
                pointSize: this.points[0].size,
                pointColor: this.points[0].color
            };
        } else {
            return {
                order: this.order,
                tailSize: this.tailSize,
                smooth: this.smooth,
                points: this.points.map(function (p) {
                    return shapeToJSON(p);
                })
            };
        }
    },
    fromJSON: function fromJSON(data) {
        return _createLinePathFromData("LinePath", data);
    },
    addPoint: function addPoint(point) {
        this.points.push(point);

        if (!this.smooth) {
            this.smoothedPoints = this.points;
            return;
        }

        if (!this.smoothedPoints || this.points.length < this.sampleSize) {
            this.smoothedPoints = bspline(this.points, this.order);
        } else {
            this.tail = (0, _util.last)(bspline((0, _util.last)(this.points, this.sampleSize), this.order), this.segmentSize * this.tailSize);

            // Remove the last @tailSize - 1 segments from @smoothedPoints
            // then concat the tail. This is done because smoothed points
            // close to the end of the path will change as new points are
            // added.
            this.smoothedPoints = this.smoothedPoints.slice(0, this.smoothedPoints.length - this.segmentSize * (this.tailSize - 1)).concat(this.tail);
        }
    },
    move: function move(moveInfo) {
        var pts = void 0;
        if (moveInfo == null) {
            moveInfo = {};
        }
        if (!this.smooth) {
            pts = this.points;
        } else {
            pts = this.smoothedPoints;
        }

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = pts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var pt = _step4.value;

                pt.move(moveInfo);
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

        this.points = this.smoothedPoints;
    },
    setUpperLeft: function setUpperLeft(upperLeft) {
        if (upperLeft == null) {
            upperLeft = {};
        }
        var br = this.getBoundingRect();
        var xDiff = br.x - upperLeft.x;
        var yDiff = br.y - upperLeft.y;
        this.move({ xDiff: xDiff, yDiff: yDiff });
    }
};

var LinePath = defineShape("LinePath", linePathFuncs);

defineShape("ErasedLinePath", {
    constructor: linePathFuncs.constructor,
    toJSON: linePathFuncs.toJSON,
    addPoint: linePathFuncs.addPoint,
    getBoundingRect: linePathFuncs.getBoundingRect,

    fromJSON: function fromJSON(data) {
        return _createLinePathFromData("ErasedLinePath", data);
    }
});

// this is currently just used for LinePath/ErasedLinePath internal storage.
defineShape("Point", {
    constructor: function constructor(args) {
        if (args == null) {
            args = {};
        }
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.size = args.size || 0;
        this.color = args.color || "";
    },
    getBoundingRect: function getBoundingRect() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    },
    toJSON: function toJSON() {
        return { x: this.x, y: this.y, size: this.size, color: this.color };
    },
    fromJSON: function fromJSON(data) {
        return createShape("Point", data);
    },
    move: function move(moveInfo) {
        if (moveInfo == null) {
            moveInfo = {};
        }
        this.x = this.x - moveInfo.xDiff;
        this.y = this.y - moveInfo.yDiff;
    },
    setUpperLeft: function setUpperLeft(upperLeft) {
        if (upperLeft == null) {
            upperLeft = {};
        }
        this.x = upperLeft.x;
        this.y = upperLeft.y;
    }
});

defineShape("Polygon", {
    constructor: function constructor(args) {
        var _this2 = this;

        if (args == null) {
            args = {};
        }
        this.points = args.points;
        this.fillColor = args.fillColor || "white";
        this.strokeColor = args.strokeColor || "black";
        this.strokeWidth = args.strokeWidth;
        this.dash = args.dash || null;

        if (args.isClosed == null) {
            args.isClosed = true;
        }
        this.isClosed = args.isClosed;

        // ignore point values
        this.points.forEach(function (point) {
            point.color = _this2.strokeColor;
            point.size = _this2.strokeWidth;
        });
    },
    addPoint: function addPoint(x, y) {
        this.points.push(createShape("Point", { x: x, y: y }));
    },
    getBoundingRect: function getBoundingRect() {
        return (0, _util.getBoundingRect)(this.points.map(function (p) {
            return p.getBoundingRect();
        }));
    },
    toJSON: function toJSON() {
        return {
            strokeWidth: this.strokeWidth,
            fillColor: this.fillColor,
            strokeColor: this.strokeColor,
            dash: this.dash,
            isClosed: this.isClosed,
            pointCoordinatePairs: this.points.map(function (p) {
                return [p.x, p.y];
            })
        };
    },
    fromJSON: function fromJSON(data) {
        data.points = data.pointCoordinatePairs.map(function () {
            var _ref6 = arguments.length <= 0 ? undefined : arguments[0],
                _ref7 = _slicedToArray(_ref6, 2),
                x = _ref7[0],
                y = _ref7[1];

            return createShape("Point", {
                x: x,
                y: y,
                size: data.strokeWidth,
                color: data.strokeColor
            });
        });
        return createShape("Polygon", data);
    },
    move: function move(moveInfo) {
        if (moveInfo == null) {
            moveInfo = {};
        }
        this.points.map(function (pt) {
            return pt.move(moveInfo);
        });
    },
    setUpperLeft: function setUpperLeft(upperLeft) {
        if (upperLeft == null) {
            upperLeft = {};
        }
        var br = this.getBoundingRect();
        var xDiff = br.x - upperLeft.x;
        var yDiff = br.y - upperLeft.y;
        this.move({ xDiff: xDiff, yDiff: yDiff });
    }
});

defineShape("Text", {
    constructor: function constructor(args) {
        if (args == null) {
            args = {};
        }
        this.x = args.x || 0;
        this.y = args.y || 0;
        this.v = args.v || 0; // version (<1 needs position repaired)
        this.text = args.text || "";
        this.color = args.color || "black";
        this.font = args.font || "18px sans-serif";
        this.forcedWidth = args.forcedWidth || null;
        this.forcedHeight = args.forcedHeight || null;
    },
    _makeRenderer: function _makeRenderer(ctx) {
        ctx.lineHeight = 1.2;
        this.renderer = new _TextRenderer2.default(ctx, this.text, this.font, this.forcedWidth, this.forcedHeight);

        if (this.v < 1) {
            console.log("repairing baseline");
            this.v = 1;
            this.x -= this.renderer.metrics.bounds.minx;
            this.y -= this.renderer.metrics.leading - this.renderer.metrics.descent;
        }
    },
    setText: function setText(text) {
        this.text = text;
        this.renderer = null;
    },
    setFont: function setFont(font) {
        this.font = font;
        this.renderer = null;
    },
    setPosition: function setPosition(x, y) {
        this.x = x;
        this.y = y;
    },
    setSize: function setSize(forcedWidth, forcedHeight) {
        this.forcedWidth = Math.max(forcedWidth, 0);
        this.forcedHeight = Math.max(forcedHeight, 0);
        this.renderer = null;
    },
    enforceMaxBoundingRect: function enforceMaxBoundingRect(lc) {
        var br = this.getBoundingRect(lc.ctx);
        var lcBoundingRect = {
            x: -lc.position.x / lc.scale,
            y: -lc.position.y / lc.scale,
            width: lc.canvas.width / lc.scale,
            height: lc.canvas.height / lc.scale
        };
        // really just enforce max width
        if (br.x + br.width > lcBoundingRect.x + lcBoundingRect.width) {
            var dx = br.x - lcBoundingRect.x;
            this.forcedWidth = lcBoundingRect.width - dx - 10;
            this.renderer = null;
        }
    },
    getBoundingRect: function getBoundingRect(ctx, isEditing) {
        // if isEditing == true, add X padding to account for carat
        if (isEditing == null) {
            isEditing = false;
        }
        if (!this.renderer) {
            if (ctx) {
                this._makeRenderer(ctx);
            } else {
                throw "Must pass ctx if text hasn't been rendered yet";
            }
        }
        return {
            x: Math.floor(this.x),
            y: Math.floor(this.y),
            width: Math.ceil(this.renderer.getWidth(true)),
            height: Math.ceil(this.renderer.getHeight())
        };
    },
    toJSON: function toJSON() {
        return {
            x: this.x,
            y: this.y,
            text: this.text,
            color: this.color,
            font: this.font,
            forcedWidth: this.forcedWidth,
            forcedHeight: this.forcedHeight,
            v: this.v
        };
    },
    fromJSON: function fromJSON(data) {
        return createShape("Text", data);
    },
    move: function move(moveInfo) {
        if (moveInfo == null) {
            moveInfo = {};
        }
        this.x = this.x - moveInfo.xDiff;
        this.y = this.y - moveInfo.yDiff;
    },
    setUpperLeft: function setUpperLeft(upperLeft) {
        if (upperLeft == null) {
            upperLeft = {};
        }
        this.x = upperLeft.x;
        this.y = upperLeft.y;
    }
});

defineShape("SelectionBox", {
    constructor: function constructor(args) {
        if (args == null) {
            args = {};
        }
        this.shape = args.shape;
        if (args.handleSize != null) {
            this.handleSize = args.handleSize;
        } else {
            this.handleSize = 10;
        }
        this.margin = 4;
        this.backgroundColor = args.backgroundColor || null;
        this._br = this.shape.getBoundingRect(args.ctx);
    },
    toJSON: function toJSON() {
        return {
            shape: shapeToJSON(this.shape),
            backgroundColor: this.backgroundColor
        };
    },
    fromJSON: function fromJSON(_ref8) {
        var shape = _ref8.shape,
            handleSize = _ref8.handleSize,
            margin = _ref8.margin,
            backgroundColor = _ref8.backgroundColor;

        return createShape("SelectionBox", {
            shape: JSONToShape(shape),
            backgroundColor: backgroundColor
        });
    },
    getTopLeftHandleRect: function getTopLeftHandleRect() {
        return {
            x: this._br.x - this.handleSize - this.margin,
            y: this._br.y - this.handleSize - this.margin,
            width: this.handleSize,
            height: this.handleSize
        };
    },
    getBottomLeftHandleRect: function getBottomLeftHandleRect() {
        return {
            x: this._br.x - this.handleSize - this.margin,
            y: this._br.y + this._br.height + this.margin,
            width: this.handleSize,
            height: this.handleSize
        };
    },
    getTopRightHandleRect: function getTopRightHandleRect() {
        return {
            x: this._br.x + this._br.width + this.margin,
            y: this._br.y - this.handleSize - this.margin,
            width: this.handleSize,
            height: this.handleSize
        };
    },
    getBottomRightHandleRect: function getBottomRightHandleRect() {
        return {
            x: this._br.x + this._br.width + this.margin,
            y: this._br.y + this._br.height + this.margin,
            width: this.handleSize,
            height: this.handleSize
        };
    },
    getBoundingRect: function getBoundingRect() {
        return {
            x: this._br.x - this.margin,
            y: this._br.y - this.margin,
            width: this._br.width + this.margin * 2,
            height: this._br.height + this.margin * 2
        };
    }
});

exports.defineShape = defineShape;
exports.createShape = createShape;
exports.JSONToShape = JSONToShape;
exports.shapeToJSON = shapeToJSON;