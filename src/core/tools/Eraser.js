"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Pencil2 = require("./Pencil");

var _Pencil3 = _interopRequireDefault(_Pencil2);

var _shapes = require("../shapes");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Eraser = function (_Pencil) {
    _inherits(Eraser, _Pencil);

    function Eraser() {
        _classCallCheck(this, Eraser);

        return _possibleConstructorReturn(this, (Eraser.__proto__ || Object.getPrototypeOf(Eraser)).apply(this, arguments));
    }

    _createClass(Eraser, [{
        key: "makePoint",
        value: function makePoint(x, y, lc) {
            return (0, _shapes.createShape)("Point", {
                x: x,
                y: y,
                size: this.strokeWidth,
                color: "#000"
            });
        }
    }, {
        key: "makeShape",
        value: function makeShape() {
            return (0, _shapes.createShape)("ErasedLinePath");
        }
    }]);

    return Eraser;
}(_Pencil3.default);

Eraser.prototype.name = "Eraser";
Eraser.prototype.iconName = "eraser";

exports.default = Eraser;