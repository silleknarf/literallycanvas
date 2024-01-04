"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _base = require("./base");

var _shapes = require("../shapes");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Polygon = function (_ToolWithStroke) {
    _inherits(Polygon, _ToolWithStroke);

    function Polygon(lc) {
        _classCallCheck(this, Polygon);

        return _possibleConstructorReturn(this, (Polygon.__proto__ || Object.getPrototypeOf(Polygon)).call(this, lc));
    }

    _createClass(Polygon, [{
        key: "didBecomeActive",
        value: function didBecomeActive(lc) {
            var onDown = void 0,
                onMove = void 0,
                onUp = void 0,
                polygonCancel = void 0,
                polygonFinishClosed = void 0,
                polygonFinishOpen = void 0,
                polygonUnsubscribeFuncs = void 0;

            _get(Polygon.prototype.__proto__ || Object.getPrototypeOf(Polygon.prototype), "didBecomeActive", this).call(this, lc);
            polygonUnsubscribeFuncs = [];
            this.polygonUnsubscribe = function (_this) {
                return function () {
                    var func = void 0,
                        i = void 0,
                        len = void 0,
                        results = void 0;
                    results = [];
                    for (i = 0, len = polygonUnsubscribeFuncs.length; i < len; i++) {
                        func = polygonUnsubscribeFuncs[i];
                        results.push(func());
                    }
                    return results;
                };
            }(this);
            this.points = null;
            this.maybePoint = null;
            onUp = function (_this) {
                return function () {
                    if (_this._getWillFinish()) {
                        return _this._close(lc);
                    }
                    lc.trigger("lc-polygon-started");
                    if (_this.points) {
                        _this.points.push(_this.maybePoint);
                    } else {
                        _this.points = [_this.maybePoint];
                    }
                    _this.maybePoint = {
                        x: _this.maybePoint.x,
                        y: _this.maybePoint.y
                    };
                    lc.setShapesInProgress(_this._getShapes(lc));
                    return lc.repaintLayer("main");
                };
            }(this);
            onMove = function (_this) {
                return function (arg) {
                    var x, y;
                    x = arg.x, y = arg.y;
                    if (_this.maybePoint) {
                        _this.maybePoint.x = x;
                        _this.maybePoint.y = y;
                        lc.setShapesInProgress(_this._getShapes(lc));
                        return lc.repaintLayer("main");
                    }
                };
            }(this);
            onDown = function (_this) {
                return function (arg) {
                    var x, y;
                    x = arg.x, y = arg.y;
                    _this.maybePoint = {
                        x: x,
                        y: y
                    };
                    lc.setShapesInProgress(_this._getShapes(lc));
                    return lc.repaintLayer("main");
                };
            }(this);
            polygonFinishOpen = function (_this) {
                return function () {
                    _this.maybePoint = {
                        x: Infinity,
                        y: Infinity
                    };
                    return _this._close(lc);
                };
            }(this);
            polygonFinishClosed = function (_this) {
                return function () {
                    _this.maybePoint = _this.points[0];
                    return _this._close(lc);
                };
            }(this);
            polygonCancel = function (_this) {
                return function () {
                    return _this._cancel(lc);
                };
            }(this);
            polygonUnsubscribeFuncs.push(lc.on("drawingChange", function (_this) {
                return function () {
                    return _this._cancel(lc);
                };
            }(this)));
            polygonUnsubscribeFuncs.push(lc.on("lc-pointerdown", onDown));
            polygonUnsubscribeFuncs.push(lc.on("lc-pointerdrag", onMove));
            polygonUnsubscribeFuncs.push(lc.on("lc-pointermove", onMove));
            polygonUnsubscribeFuncs.push(lc.on("lc-pointerup", onUp));
            polygonUnsubscribeFuncs.push(lc.on("lc-polygon-finishopen", polygonFinishOpen));
            polygonUnsubscribeFuncs.push(lc.on("lc-polygon-finishclosed", polygonFinishClosed));
            return polygonUnsubscribeFuncs.push(lc.on("lc-polygon-cancel", polygonCancel));
        }
    }, {
        key: "willBecomeInactive",
        value: function willBecomeInactive(lc) {
            _get(Polygon.prototype.__proto__ || Object.getPrototypeOf(Polygon.prototype), "willBecomeInactive", this).call(this, lc);
            if (this.points || this.maybePoint) {
                this._cancel(lc);
            }
            return this.polygonUnsubscribe();
        }
    }, {
        key: "_getArePointsClose",
        value: function _getArePointsClose(a, b) {
            return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) < 10;
        }
    }, {
        key: "_getWillClose",
        value: function _getWillClose() {
            if (!(this.points && this.points.length > 1)) {
                return false;
            }
            if (!this.maybePoint) {
                return false;
            }
            return this._getArePointsClose(this.points[0], this.maybePoint);
        }
    }, {
        key: "_getWillFinish",
        value: function _getWillFinish() {
            if (!(this.points && this.points.length > 1)) {
                return false;
            }
            if (!this.maybePoint) {
                return false;
            }
            return this._getArePointsClose(this.points[0], this.maybePoint) || this._getArePointsClose(this.points[this.points.length - 1], this.maybePoint);
        }
    }, {
        key: "_cancel",
        value: function _cancel(lc) {
            lc.trigger("lc-polygon-stopped");
            this.maybePoint = null;
            this.points = null;
            lc.setShapesInProgress([]);
            return lc.repaintLayer("main");
        }
    }, {
        key: "_close",
        value: function _close(lc) {
            lc.trigger("lc-polygon-stopped");
            lc.setShapesInProgress([]);
            if (this.points.length > 2) {
                lc.saveShape(this._getShape(lc, false));
            }
            this.maybePoint = null;
            return this.points = null;
        }
    }, {
        key: "_getShapes",
        value: function _getShapes(lc, isInProgress) {
            var shape;
            if (isInProgress == null) {
                isInProgress = true;
            }
            shape = this._getShape(lc, isInProgress);
            if (shape) {
                return [shape];
            } else {
                return [];
            }
        }
    }, {
        key: "_getShape",
        value: function _getShape(lc, isInProgress) {
            var points;
            if (isInProgress == null) {
                isInProgress = true;
            }
            points = [];
            if (this.points) {
                points = points.concat(this.points);
            }
            if (!isInProgress && points.length < 3) {
                return null;
            }
            if (isInProgress && this.maybePoint) {
                points.push(this.maybePoint);
            }
            if (points.length > 1) {
                return (0, _shapes.createShape)("Polygon", {
                    isClosed: this._getWillClose(),
                    strokeColor: lc.getColor("primary"),
                    fillColor: lc.getColor("secondary"),
                    strokeWidth: this.strokeWidth,
                    points: points.map(function (xy) {
                        return (0, _shapes.createShape)("Point", xy);
                    })
                });
            } else {
                return null;
            }
        }
    }]);

    return Polygon;
}(_base.ToolWithStroke);

Polygon.prototype.name = "Polygon";
Polygon.prototype.iconName = "polygon";
Polygon.prototype.usesSimpleAPI = false;
Polygon.prototype.optionsStyle = "polygon-and-stroke-width";

exports.default = Polygon;