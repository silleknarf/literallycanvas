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

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Tool = function () {
    function Tool() {
        _classCallCheck(this, Tool);
    }

    // called when the user starts dragging


    _createClass(Tool, [{
        key: "begin",
        value: function begin(x, y, lc) {}

        // called when the user moves while dragging

    }, {
        key: "continue",
        value: function _continue(x, y, lc) {}

        // called when the user finishes dragging

    }, {
        key: "end",
        value: function end(x, y, lc) {}
    }, {
        key: "didBecomeActive",
        value: function didBecomeActive(lc) {}
    }, {
        key: "willBecomeInactive",
        value: function willBecomeInactive(lc) {}
    }]);

    return Tool;
}();

Tool.prototype.name = null; // for debugging
Tool.prototype.iconName = null; // {imageURLPrefix}/{iconName}.png
Tool.prototype.usesSimpleAPI = true;
Tool.prototype.optionsStyle = null; // kind of options GUI to display

var ToolWithStroke = function (_Tool) {
    _inherits(ToolWithStroke, _Tool);

    function ToolWithStroke(lc) {
        _classCallCheck(this, ToolWithStroke);

        var _this = _possibleConstructorReturn(this, (ToolWithStroke.__proto__ || Object.getPrototypeOf(ToolWithStroke)).call(this));

        _this.strokeWidth = lc.opts.defaultStrokeWidth;
        return _this;
    }

    _createClass(ToolWithStroke, [{
        key: "didBecomeActive",
        value: function didBecomeActive(lc) {
            var _this2 = this;

            var unsubscribeFuncs = [];
            this.unsubscribe = function () {
                unsubscribeFuncs.map(function (func) {
                    return func();
                });
            };

            unsubscribeFuncs.push(lc.on("setStrokeWidth", function (strokeWidth) {
                _this2.strokeWidth = strokeWidth;
                lc.trigger("toolDidUpdateOptions");
            }));
        }
    }, {
        key: "willBecomeInactive",
        value: function willBecomeInactive(lc) {
            this.unsubscribe();
        }
    }]);

    return ToolWithStroke;
}(Tool);

ToolWithStroke.prototype.optionsStyle = "stroke-width";

exports.Tool = Tool;
exports.ToolWithStroke = ToolWithStroke;