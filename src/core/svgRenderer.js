"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderShapeToSVG = exports.defineSVGRenderer = undefined;

var _lineEndCapShapes = require("./lineEndCapShapes");

var _lineEndCapShapes2 = _interopRequireDefault(_lineEndCapShapes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var renderers = {};

// shapeToSVG(shape) -> string
var defineSVGRenderer = function defineSVGRenderer(shapeName, shapeToSVGFunc) {
    return renderers[shapeName] = shapeToSVGFunc;
};

var renderShapeToSVG = function renderShapeToSVG(shape, opts) {
    if (opts == null) {
        opts = {};
    }
    if (opts.shouldIgnoreUnsupportedShapes == null) {
        opts.shouldIgnoreUnsupportedShapes = false;
    }

    if (renderers[shape.className]) {
        return renderers[shape.className](shape);
    } else if (opts.shouldIgnoreUnsupportedShapes) {
        console.warn("Can't render shape of type " + shape.className + " to SVG");
        return "";
    } else {
        throw "Can't render shape of type " + shape.className + " to SVG";
    }
};

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;"
};

var escapeHTML = function escapeHTML(string) {
    return String(string).replace(/[&<>"'`=/]/g, function (s) {
        return entityMap[s];
    });
};

defineSVGRenderer("Rectangle", function (shape) {
    var x1 = shape.x;
    var y1 = shape.y;
    var x2 = shape.x + shape.width;
    var y2 = shape.y + shape.height;

    var x = Math.min(x1, x2);
    var y = Math.min(y1, y2);
    var width = Math.max(x1, x2) - x;
    var height = Math.max(y1, y2) - y;

    if (shape.strokeWidth % 2 !== 0) {
        x += 0.5;
        y += 0.5;
    }

    return "<rect x='" + x + "' y='" + y + "' width='" + width + "' height='" + height + "' stroke='" + shape.strokeColor + "' fill='" + shape.fillColor + "' stroke-width='" + shape.strokeWidth + "' />";
});

defineSVGRenderer("SelectionBox", function () {});

defineSVGRenderer("Ellipse", function (shape) {
    var halfWidth = Math.floor(shape.width / 2);
    var halfHeight = Math.floor(shape.height / 2);
    var centerX = shape.x + halfWidth;
    var centerY = shape.y + halfHeight;
    return "<ellipse cx='" + centerX + "' cy='" + centerY + "' rx='" + Math.abs(halfWidth) + "' ry='" + Math.abs(halfHeight) + "' stroke='" + shape.strokeColor + "' fill='" + shape.fillColor + "' stroke-width='" + shape.strokeWidth + "' />";
});

defineSVGRenderer("Image", function (shape) {
    return (
        // This will only work when embedded in a web page.
        "<image x='" + shape.x + "' y='" + shape.y + "' width='" + shape.image.naturalWidth * shape.scale + "' height='" + shape.image.naturalHeight * shape.scale + "' xlink:href='" + shape.image.src + "' />"
    );
});

defineSVGRenderer("Line", function (shape) {
    var dashString = shape.dash ? "stroke-dasharray='" + shape.dash.join(", ") + "'" : "";
    var capString = "";
    var arrowWidth = Math.max(shape.strokeWidth * 2.2, 5);

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

    if (shape.endCapShapes[0]) {
        capString += _lineEndCapShapes2.default[shape.endCapShapes[0]].svg(x1, y1, Math.atan2(y1 - y2, x1 - x2), arrowWidth, shape.color);
    }
    if (shape.endCapShapes[1]) {
        capString += _lineEndCapShapes2.default[shape.endCapShapes[1]].svg(x2, y2, Math.atan2(y2 - y1, x2 - x1), arrowWidth, shape.color);
    }
    return "<g> <line x1='" + x1 + "' y1='" + y1 + "' x2='" + x2 + "' y2='" + y2 + "' " + dashString + " stroke-linecap='" + shape.capStyle + "' stroke='" + shape.color + "' stroke-width='" + shape.strokeWidth + "' /> " + capString + " </g>";
});

defineSVGRenderer("LinePath", function (shape) {
    return "<polyline fill='none' points='" + shape.smoothedPoints.map(function (p) {
        var offset = p.strokeWidth % 2 === 0 ? 0.0 : 0.5;
        return p.x + offset + "," + (p.y + offset);
    }).join(" ") + "' stroke='" + shape.points[0].color + "' stroke-linecap='round' stroke-width='" + shape.points[0].size + "' />";
});

// silently skip erasers
defineSVGRenderer("ErasedLinePath", function () {});

defineSVGRenderer("Polygon", function (shape) {
    if (shape.isClosed) {
        return "<polygon fill='" + shape.fillColor + "' points='" + shape.points.map(function (p) {
            var offset = p.strokeWidth % 2 === 0 ? 0.0 : 0.5;
            return p.x + offset + "," + (p.y + offset);
        }).join(" ") + "' stroke='" + shape.strokeColor + "' stroke-width='" + shape.strokeWidth + "' />";
    } else {
        return "<polyline fill='" + shape.fillColor + "' points='" + shape.points.map(function (p) {
            var offset = p.strokeWidth % 2 === 0 ? 0.0 : 0.5;
            return p.x + offset + "," + (p.y + offset);
        }).join(" ") + "' stroke='none' /> <polyline fill='none' points='" + shape.points.map(function (p) {
            var offset = p.strokeWidth % 2 === 0 ? 0.0 : 0.5;
            return p.x + offset + "," + (p.y + offset);
        }).join(" ") + "' stroke='" + shape.strokeColor + "' stroke-width='" + shape.strokeWidth + "' />";
    }
});

defineSVGRenderer("Text", function (shape) {
    // fallback: don't worry about auto-wrapping
    var widthString = shape.forcedWidth ? "width='" + shape.forcedWidth + "px'" : "";
    var heightString = shape.forcedHeight ? "height='" + shape.forcedHeight + "px'" : "";
    var textSplitOnLines = shape.text.split(/\r\n|\r|\n/g);

    if (shape.renderer) {
        textSplitOnLines = shape.renderer.lines;
    }

    return "<text x='" + shape.x + "' y='" + shape.y + "' " + widthString + " " + heightString + " fill='" + shape.color + "' style='font: " + shape.font + ";'> " + textSplitOnLines.map(function (line, i) {
        var dy = i === 0 ? 0 : "1.2em";
        return "<tspan x='" + shape.x + "' dy='" + dy + "' alignment-baseline='text-before-edge'> " + escapeHTML(line) + " </tspan>";
    }).join("") + " </text>";
});

exports.defineSVGRenderer = defineSVGRenderer;
exports.renderShapeToSVG = renderShapeToSVG;