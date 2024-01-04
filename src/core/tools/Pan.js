"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require("./base");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Pan = function (_Tool) {
    _inherits(Pan, _Tool);

    function Pan() {
        _classCallCheck(this, Pan);

        return _possibleConstructorReturn(this, (Pan.__proto__ || Object.getPrototypeOf(Pan)).apply(this, arguments));
    }

    _createClass(Pan, [{
        key: "didBecomeActive",
        value: function didBecomeActive(lc) {
            var unsubscribeFuncs = [];
            this.unsubscribe = function (_this) {
                return function () {
                    var func = void 0,
                        i = void 0,
                        len = void 0,
                        results = void 0;
                    results = [];
                    for (i = 0, len = unsubscribeFuncs.length; i < len; i++) {
                        func = unsubscribeFuncs[i];
                        results.push(func());
                    }
                    return results;
                };
            }(this);
            unsubscribeFuncs.push(lc.on("lc-pointerdown", function (_this) {
                return function (arg) {
                    var rawX = void 0,
                        rawY = void 0;
                    rawX = arg.rawX, rawY = arg.rawY;
                    _this.oldPosition = lc.position;
                    return _this.pointerStart = {
                        x: rawX,
                        y: rawY
                    };
                };
            }(this)));
            return unsubscribeFuncs.push(lc.on("lc-pointerdrag", function (_this) {
                return function (arg) {
                    var dp = void 0,
                        rawX = void 0,
                        rawY = void 0;
                    rawX = arg.rawX, rawY = arg.rawY;
                    dp = {
                        x: (rawX - _this.pointerStart.x) * lc.backingScale,
                        y: (rawY - _this.pointerStart.y) * lc.backingScale
                    };
                    return lc.setPan(_this.oldPosition.x + dp.x, _this.oldPosition.y + dp.y);
                };
            }(this)));
        }
    }, {
        key: "willBecomeInactive",
        value: function willBecomeInactive(lc) {
            return this.unsubscribe();
        }
    }]);

    return Pan;
}(_base.Tool);

Pan.prototype.name = "Pan";
Pan.prototype.iconName = "pan";
Pan.prototype.usesSimpleAPI = false;

exports.default = Pan;