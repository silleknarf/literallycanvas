"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require("./base");

var _shapes = require("../shapes");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Line = function (_ToolWithStroke) {
    _inherits(Line, _ToolWithStroke);

    function Line() {
        _classCallCheck(this, Line);

        return _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).apply(this, arguments));
    }

    _createClass(Line, [{
        key: "begin",
        value: function begin(x, y, lc) {
            return this.currentShape = (0, _shapes.createShape)("Line", {
                x1: x,
                y1: y,
                x2: x,
                y2: y,
                strokeWidth: this.strokeWidth,
                dash: function () {
                    switch (false) {
                        case !this.isDashed:
                            return [this.strokeWidth * 2, this.strokeWidth * 4];
                        default:
                            return null;
                    }
                }.call(this),
                endCapShapes: this.hasEndArrow ? [null, "arrow"] : null,
                color: lc.getColor("primary")
            });
        }
    }, {
        key: "continue",
        value: function _continue(x, y, lc) {
            this.currentShape.x2 = x;
            this.currentShape.y2 = y;
            return lc.drawShapeInProgress(this.currentShape);
        }
    }, {
        key: "end",
        value: function end(x, y, lc) {
            return lc.saveShape(this.currentShape);
        }
    }]);

    return Line;
}(_base.ToolWithStroke);

Line.prototype.name = "Line";
Line.prototype.iconName = "line";
Line.prototype.optionsStyle = "line-options-and-stroke-width";

exports.default = Line;