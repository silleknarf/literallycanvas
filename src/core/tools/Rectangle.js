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

var Rectangle = function (_ToolWithStroke) {
    _inherits(Rectangle, _ToolWithStroke);

    function Rectangle() {
        _classCallCheck(this, Rectangle);

        return _possibleConstructorReturn(this, (Rectangle.__proto__ || Object.getPrototypeOf(Rectangle)).apply(this, arguments));
    }

    _createClass(Rectangle, [{
        key: "begin",
        value: function begin(x, y, lc) {
            return this.currentShape = (0, _shapes.createShape)("Rectangle", {
                x: x,
                y: y,
                strokeWidth: this.strokeWidth,
                strokeColor: lc.getColor("primary"),
                fillColor: lc.getColor("secondary")
            });
        }
    }, {
        key: "continue",
        value: function _continue(x, y, lc) {
            this.currentShape.width = x - this.currentShape.x;
            this.currentShape.height = y - this.currentShape.y;
            return lc.drawShapeInProgress(this.currentShape);
        }
    }, {
        key: "end",
        value: function end(x, y, lc) {
            return lc.saveShape(this.currentShape);
        }
    }]);

    return Rectangle;
}(_base.ToolWithStroke);

Rectangle.prototype.name = "Rectangle";
Rectangle.prototype.iconName = "rectangle";

exports.default = Rectangle;