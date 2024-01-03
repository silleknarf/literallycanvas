"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var math = {};

math.toPoly = function (line) {
    var polyLeft = [];
    var polyRight = [];

    var index = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = line[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var point = _step.value;

            var n = normals(point, _slope(line, index));
            polyLeft = polyLeft.concat([n[0]]);
            polyRight = [n[1]].concat(polyRight);
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

    return polyLeft.concat(polyRight);
};

var _slope = function _slope(line, index) {
    var point = void 0;
    if (line.length < 3) {
        point = { x: 0, y: 0 };
    }
    if (index === 0) {
        point = _slope(line, index + 1);
    } else if (index === line.length - 1) {
        point = _slope(line, index - 1);
    } else {
        point = math.diff(line[index - 1], line[index + 1]);
    }

    return point;
};

math.diff = function (a, b) {
    return { x: b.x - a.x, y: b.y - a.y };
};

var unit = function unit(vector) {
    var length = math.len(vector);
    return { x: vector.x / length, y: vector.y / length };
};

var normals = function normals(p, slope) {
    slope = unit(slope);
    slope.x = slope.x * p.size / 2;
    slope.y = slope.y * p.size / 2;
    return [{ x: p.x - slope.y, y: p.y + slope.x, color: p.color }, { x: p.x + slope.y, y: p.y - slope.x, color: p.color }];
};

math.len = function (vector) {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
};

math.scalePositionScalar = function (val, viewportSize, oldScale, newScale) {
    var oldSize = viewportSize * oldScale;
    var newSize = viewportSize * newScale;
    return val + (oldSize - newSize) / 2;
};

exports.default = math;