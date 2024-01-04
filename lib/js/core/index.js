"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Polygon = exports.Text = exports.SelectShape = exports.Rectangle = exports.Pan = exports.Eyedropper = exports.Ellipse = exports.Eraser = exports.Line = exports.Pencil = exports.toolsBase = exports.util = exports.TextRenderer = exports.svgRenderer = exports.shapes = exports.renderSnapshotToSVG = exports.renderSnapshotToImage = exports.math = exports.localization = exports.LiterallyCanvas = exports.lineEndCapShapes = exports.defaultOptions = exports.canvasRenderer = exports.bindEvents = exports.actions = undefined;

var _tools = require("./tools");

var _actions = require("./actions");

var actions = _interopRequireWildcard(_actions);

var _bindEvents = require("./bindEvents");

var _bindEvents2 = _interopRequireDefault(_bindEvents);

var _canvasRenderer = require("./canvasRenderer");

var canvasRenderer = _interopRequireWildcard(_canvasRenderer);

var _defaultOptions = require("./defaultOptions");

var _defaultOptions2 = _interopRequireDefault(_defaultOptions);

var _lineEndCapShapes = require("./lineEndCapShapes");

var _lineEndCapShapes2 = _interopRequireDefault(_lineEndCapShapes);

var _LiterallyCanvas = require("./LiterallyCanvas");

var _LiterallyCanvas2 = _interopRequireDefault(_LiterallyCanvas);

var _localization = require("./localization");

var localization = _interopRequireWildcard(_localization);

var _math = require("./math");

var _math2 = _interopRequireDefault(_math);

var _renderSnapshotToImage = require("./renderSnapshotToImage");

var _renderSnapshotToImage2 = _interopRequireDefault(_renderSnapshotToImage);

var _renderSnapshotToSVG = require("./renderSnapshotToSVG");

var _renderSnapshotToSVG2 = _interopRequireDefault(_renderSnapshotToSVG);

var _shapes = require("./shapes");

var shapes = _interopRequireWildcard(_shapes);

var _svgRenderer = require("./svgRenderer");

var svgRenderer = _interopRequireWildcard(_svgRenderer);

var _TextRenderer = require("./TextRenderer");

var _TextRenderer2 = _interopRequireDefault(_TextRenderer);

var _util = require("./util");

var util = _interopRequireWildcard(_util);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {};if (obj != null) {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
        }newObj.default = obj;return newObj;
    }
}

exports.actions = actions;
exports.bindEvents = _bindEvents2.default;
exports.canvasRenderer = canvasRenderer;
exports.defaultOptions = _defaultOptions2.default;
exports.lineEndCapShapes = _lineEndCapShapes2.default;
exports.LiterallyCanvas = _LiterallyCanvas2.default;
exports.localization = localization;
exports.math = _math2.default;
exports.renderSnapshotToImage = _renderSnapshotToImage2.default;
exports.renderSnapshotToSVG = _renderSnapshotToSVG2.default;
exports.shapes = shapes;
exports.svgRenderer = svgRenderer;
exports.TextRenderer = _TextRenderer2.default;
exports.util = util;
exports.toolsBase = _tools.toolsBase;
exports.Pencil = _tools.Pencil;
exports.Line = _tools.Line;
exports.Eraser = _tools.Eraser;
exports.Ellipse = _tools.Ellipse;
exports.Eyedropper = _tools.Eyedropper;
exports.Pan = _tools.Pan;
exports.Rectangle = _tools.Rectangle;
exports.SelectShape = _tools.SelectShape;
exports.Text = _tools.Text;
exports.Polygon = _tools.Polygon;

if (window) {
    window.LC = {
        actions: actions,
        bindEvents: _bindEvents2.default,
        canvasRenderer: canvasRenderer,
        defaultOptions: _defaultOptions2.default,
        lineEndCapShapes: _lineEndCapShapes2.default,
        LiterallyCanvas: _LiterallyCanvas2.default,
        localization: localization,
        math: _math2.default,
        renderSnapshotToImage: _renderSnapshotToImage2.default,
        renderSnapshotToSVG: _renderSnapshotToSVG2.default,
        shapes: shapes,
        svgRenderer: svgRenderer,
        TextRenderer: _TextRenderer2.default,
        util: util,
        toolsBase: _tools.toolsBase,
        Pencil: _tools.Pencil,
        Line: _tools.Line,
        Eraser: _tools.Eraser,
        Ellipse: _tools.Ellipse,
        Eyedropper: _tools.Eyedropper,
        Pan: _tools.Pan,
        Rectangle: _tools.Rectangle,
        SelectShape: _tools.SelectShape,
        Text: _tools.Text,
        Polygon: _tools.Polygon
    };
}

exports.default = _LiterallyCanvas2.default;