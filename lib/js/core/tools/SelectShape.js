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

var _shapes = require("../shapes");

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

var SelectShape = function (_Tool) {
    _inherits(SelectShape, _Tool);

    function SelectShape() {
        _classCallCheck(this, SelectShape);

        var _this2 = _possibleConstructorReturn(this, (SelectShape.__proto__ || Object.getPrototypeOf(SelectShape)).call(this));

        _this2.selectCanvas = document.createElement("canvas");
        _this2.selectCanvas.style["background-color"] = "transparent";
        _this2.selectCtx = _this2.selectCanvas.getContext("2d");
        return _this2;
    }

    _createClass(SelectShape, [{
        key: "didBecomeActive",
        value: function didBecomeActive(lc) {
            var onDown, onDrag, onUp, selectShapeUnsubscribeFuncs;
            selectShapeUnsubscribeFuncs = [];
            this._selectShapeUnsubscribe = function (_this) {
                return function () {
                    var func, j, len, results;
                    results = [];
                    for (j = 0, len = selectShapeUnsubscribeFuncs.length; j < len; j++) {
                        func = selectShapeUnsubscribeFuncs[j];
                        results.push(func());
                    }
                    return results;
                };
            }(this);
            onDown = function (_this) {
                return function (arg) {
                    var br, shapeIndex, x, y;
                    x = arg.x, y = arg.y;
                    _this.didDrag = false;
                    shapeIndex = _this._getPixel(x, y, lc, _this.selectCtx);
                    _this.selectedShape = lc.shapes[shapeIndex];
                    if (_this.selectedShape != null) {
                        lc.trigger("shapeSelected", {
                            selectedShape: _this.selectedShape
                        });
                        lc.setShapesInProgress([_this.selectedShape, (0, _shapes.createShape)("SelectionBox", {
                            shape: _this.selectedShape,
                            handleSize: 0
                        })]);
                        lc.repaintLayer("main");
                        br = _this.selectedShape.getBoundingRect();
                        return _this.dragOffset = {
                            x: x - br.x,
                            y: y - br.y
                        };
                    }
                };
            }(this);
            onDrag = function (_this) {
                return function (arg) {
                    var x, y;
                    x = arg.x, y = arg.y;
                    if (_this.selectedShape != null) {
                        _this.didDrag = true;
                        _this.selectedShape.setUpperLeft({
                            x: x - _this.dragOffset.x,
                            y: y - _this.dragOffset.y
                        });
                        lc.setShapesInProgress([_this.selectedShape, (0, _shapes.createShape)("SelectionBox", {
                            shape: _this.selectedShape,
                            handleSize: 0
                        })]);
                        return lc.repaintLayer("main");
                    }
                };
            }(this);
            onUp = function (_this) {
                return function (arg) {
                    var x, y;
                    x = arg.x, y = arg.y;
                    if (_this.didDrag) {
                        _this.didDrag = false;
                        lc.trigger("shapeMoved", {
                            shape: _this.selectedShape
                        });
                        lc.trigger("drawingChange", {});
                        lc.repaintLayer("main");
                        return _this._drawSelectCanvas(lc);
                    }
                };
            }(this);
            selectShapeUnsubscribeFuncs.push(lc.on("lc-pointerdown", onDown));
            selectShapeUnsubscribeFuncs.push(lc.on("lc-pointerdrag", onDrag));
            selectShapeUnsubscribeFuncs.push(lc.on("lc-pointerup", onUp));
            return this._drawSelectCanvas(lc);
        }
    }, {
        key: "willBecomeInactive",
        value: function willBecomeInactive(lc) {
            this._selectShapeUnsubscribe();
            return lc.setShapesInProgress([]);
        }
    }, {
        key: "_drawSelectCanvas",
        value: function _drawSelectCanvas(lc) {
            var shapes;
            this.selectCanvas.width = lc.canvas.width;
            this.selectCanvas.height = lc.canvas.height;
            this.selectCtx.clearRect(0, 0, this.selectCanvas.width, this.selectCanvas.height);
            shapes = lc.shapes.map(function (_this) {
                return function (shape, index) {
                    return (0, _shapes.createShape)("SelectionBox", {
                        shape: shape,
                        handleSize: 0,
                        backgroundColor: "#" + _this._intToHex(index)
                    });
                };
            }(this));
            return lc.draw(shapes, this.selectCtx);
        }
    }, {
        key: "_intToHex",
        value: function _intToHex(i) {
            return ("000000" + i.toString(16)).slice(-6);
        }
    }, {
        key: "_getPixel",
        value: function _getPixel(x, y, lc, ctx) {
            var p, pixel;
            p = lc.drawingCoordsToClientCoords(x, y);
            pixel = ctx.getImageData(p.x, p.y, 1, 1).data;
            if (pixel[3]) {
                return parseInt(this._rgbToHex(pixel[0], pixel[1], pixel[2]), 16);
            } else {
                return null;
            }
        }
    }, {
        key: "_componentToHex",
        value: function _componentToHex(c) {
            var hex;
            hex = c.toString(16);
            return ("0" + hex).slice(-2);
        }
    }, {
        key: "_rgbToHex",
        value: function _rgbToHex(r, g, b) {
            return "" + this._componentToHex(r) + this._componentToHex(g) + this._componentToHex(b);
        }
    }]);

    return SelectShape;
}(_base.Tool);

SelectShape.prototype.name = "SelectShape";
SelectShape.prototype.usesSimpleAPI = false;

exports.default = SelectShape;