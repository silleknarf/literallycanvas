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

var Pencil = function (_ToolWithStroke) {
    _inherits(Pencil, _ToolWithStroke);

    function Pencil() {
        _classCallCheck(this, Pencil);

        return _possibleConstructorReturn(this, (Pencil.__proto__ || Object.getPrototypeOf(Pencil)).apply(this, arguments));
    }

    _createClass(Pencil, [{
        key: "begin",
        value: function begin(x, y, lc) {
            this.color = lc.getColor("primary");
            this.currentShape = this.makeShape();
            this.currentShape.addPoint(this.makePoint(x, y, lc));
            this.lastEventTime = Date.now();
        }
    }, {
        key: "continue",
        value: function _continue(x, y, lc) {
            var timeDiff = Date.now() - this.lastEventTime;

            if (timeDiff > this.eventTimeThreshold) {
                this.lastEventTime += timeDiff;
                this.currentShape.addPoint(this.makePoint(x, y, lc));
                lc.drawShapeInProgress(this.currentShape);
            }
        }
    }, {
        key: "end",
        value: function end(x, y, lc) {
            lc.saveShape(this.currentShape);
            this.currentShape = undefined;
        }
    }, {
        key: "makePoint",
        value: function makePoint(x, y, lc) {
            return (0, _shapes.createShape)("Point", {
                x: x,
                y: y,
                size: this.strokeWidth,
                color: this.color
            });
        }
    }, {
        key: "makeShape",
        value: function makeShape() {
            return (0, _shapes.createShape)("LinePath");
        }
    }]);

    return Pencil;
}(_base.ToolWithStroke);

Pencil.prototype.name = "Pencil";
Pencil.prototype.iconName = "pencil";
Pencil.prototype.eventTimeThreshold = 10;

exports.default = Pencil;