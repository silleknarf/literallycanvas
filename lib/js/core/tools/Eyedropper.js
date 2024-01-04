"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _base = require("./base");

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var getPixel = function getPixel(ctx, arg) {
    var pixel, x, y;
    x = arg.x, y = arg.y;
    pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3]) {
        return "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
    } else {
        return null;
    }
};

var Eyedropper = function (_Tool) {
    _inherits(Eyedropper, _Tool);

    function Eyedropper() {
        _classCallCheck(this, Eyedropper);

        return _possibleConstructorReturn(this, (Eyedropper.__proto__ || Object.getPrototypeOf(Eyedropper)).apply(this, arguments));
    }

    _createClass(Eyedropper, [{
        key: "readColor",
        value: function readColor(x, y, lc) {
            var canvas, color, newColor, offset;
            offset = lc.getDefaultImageRect();
            canvas = lc.getImage();
            newColor = getPixel(canvas.getContext("2d"), {
                x: x - offset.x,
                y: y - offset.y
            });
            color = newColor || lc.getColor("background");
            if (this.strokeOrFill === "stroke") {
                return lc.setColor("primary", newColor);
            } else {
                return lc.setColor("secondary", newColor);
            }
        }
    }, {
        key: "begin",
        value: function begin(x, y, lc) {
            return this.readColor(x, y, lc);
        }
    }, {
        key: "continue",
        value: function _continue(x, y, lc) {
            return this.readColor(x, y, lc);
        }
    }]);

    return Eyedropper;
}(_base.Tool);

Eyedropper.prototype.name = "Eyedropper";
Eyedropper.prototype.iconName = "eyedropper";
Eyedropper.prototype.optionsStyle = "stroke-or-fill";

exports.default = Eyedropper;