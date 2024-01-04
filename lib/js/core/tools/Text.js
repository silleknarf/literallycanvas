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

var getIsPointInBox = function getIsPointInBox(point, box) {
    if (point.x < box.x) {
        return false;
    }
    if (point.y < box.y) {
        return false;
    }
    if (point.x > box.x + box.width) {
        return false;
    }
    if (point.y > box.y + box.height) {
        return false;
    }
    return true;
};

var Text = function (_Tool) {
    _inherits(Text, _Tool);

    function Text() {
        _classCallCheck(this, Text);

        var _this2 = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this));

        _this2.text = "";
        _this2.font = "bold 18px sans-serif";
        _this2.currentShape = null;
        _this2.currentShapeState = null;
        _this2.initialShapeBoundingRect = null;
        _this2.dragAction = null;
        _this2.didDrag = false;
        return _this2;
    }

    _createClass(Text, [{
        key: "didBecomeActive",
        value: function didBecomeActive(lc) {
            var switchAway, unsubscribeFuncs, updateInputEl;
            unsubscribeFuncs = [];
            this.unsubscribe = function (_this) {
                return function () {
                    var func, i, len, results;
                    results = [];
                    for (i = 0, len = unsubscribeFuncs.length; i < len; i++) {
                        func = unsubscribeFuncs[i];
                        results.push(func());
                    }
                    return results;
                };
            }(this);
            switchAway = function (_this) {
                return function () {
                    _this._ensureNotEditing(lc);
                    _this._clearCurrentShape(lc);
                    return lc.repaintLayer("main");
                };
            }(this);
            updateInputEl = function (_this) {
                return function () {
                    return _this._updateInputEl(lc);
                };
            }(this);
            unsubscribeFuncs.push(lc.on("drawingChange", switchAway));
            unsubscribeFuncs.push(lc.on("zoom", updateInputEl));
            unsubscribeFuncs.push(lc.on("imageSizeChange", updateInputEl));
            unsubscribeFuncs.push(lc.on("snapshotLoad", function (_this) {
                return function () {
                    _this._clearCurrentShape(lc);
                    return lc.repaintLayer("main");
                };
            }(this)));
            unsubscribeFuncs.push(lc.on("primaryColorChange", function (_this) {
                return function (newColor) {
                    if (!_this.currentShape) {
                        return;
                    }
                    _this.currentShape.color = newColor;
                    _this._updateInputEl(lc);
                    return lc.repaintLayer("main");
                };
            }(this)));
            return unsubscribeFuncs.push(lc.on("setFont", function (_this) {
                return function (font) {
                    if (!_this.currentShape) {
                        return;
                    }
                    _this.font = font;
                    _this.currentShape.setFont(font);
                    _this._setShapesInProgress(lc);
                    _this._updateInputEl(lc);
                    return lc.repaintLayer("main");
                };
            }(this)));
        }
    }, {
        key: "willBecomeInactive",
        value: function willBecomeInactive(lc) {
            if (this.currentShape) {
                this._ensureNotEditing(lc);
                this.commit(lc);
            }
            return this.unsubscribe();
        }
    }, {
        key: "setText",
        value: function setText(text) {
            return this.text = text;
        }
    }, {
        key: "_ensureNotEditing",
        value: function _ensureNotEditing(lc) {
            if (this.currentShapeState === "editing") {
                return this._exitEditingState(lc);
            }
        }
    }, {
        key: "_clearCurrentShape",
        value: function _clearCurrentShape(lc) {
            this.currentShape = null;
            this.initialShapeBoundingRect = null;
            this.currentShapeState = null;
            return lc.setShapesInProgress([]);
        }
    }, {
        key: "commit",
        value: function commit(lc) {
            if (this.currentShape.text) {
                lc.saveShape(this.currentShape);
            }
            this._clearCurrentShape(lc);
            return lc.repaintLayer("main");
        }
    }, {
        key: "_getSelectionShape",
        value: function _getSelectionShape(ctx, backgroundColor) {
            if (backgroundColor == null) {
                backgroundColor = null;
            }
            return (0, _shapes.createShape)("SelectionBox", {
                shape: this.currentShape,
                ctx: ctx,
                backgroundColor: backgroundColor
            });
        }
    }, {
        key: "_setShapesInProgress",
        value: function _setShapesInProgress(lc) {
            switch (this.currentShapeState) {
                case "selected":
                    return lc.setShapesInProgress([this._getSelectionShape(lc.ctx), this.currentShape]);
                case "editing":
                    return lc.setShapesInProgress([this._getSelectionShape(lc.ctx, "#fff")]);
                default:
                    return lc.setShapesInProgress([this.currentShape]);
            }
        }
    }, {
        key: "begin",
        value: function begin(x, y, lc) {
            var br, point, selectionBox, selectionShape;
            this.dragAction = "none";
            this.didDrag = false;
            if (this.currentShapeState === "selected" || this.currentShapeState === "editing") {
                br = this.currentShape.getBoundingRect(lc.ctx);
                selectionShape = this._getSelectionShape(lc.ctx);
                selectionBox = selectionShape.getBoundingRect();
                point = {
                    x: x,
                    y: y
                };
                if (getIsPointInBox(point, br)) {
                    this.dragAction = "move";
                }
                if (getIsPointInBox(point, selectionShape.getBottomRightHandleRect())) {
                    this.dragAction = "resizeBottomRight";
                }
                if (getIsPointInBox(point, selectionShape.getTopLeftHandleRect())) {
                    this.dragAction = "resizeTopLeft";
                }
                if (getIsPointInBox(point, selectionShape.getBottomLeftHandleRect())) {
                    this.dragAction = "resizeBottomLeft";
                }
                if (getIsPointInBox(point, selectionShape.getTopRightHandleRect())) {
                    this.dragAction = "resizeTopRight";
                }
                if (this.dragAction === "none" && this.currentShapeState === "editing") {
                    this.dragAction = "stop-editing";
                    this._exitEditingState(lc);
                }
            } else {
                this.color = lc.getColor("primary");
                this.currentShape = (0, _shapes.createShape)("Text", {
                    x: x,
                    y: y,
                    text: this.text,
                    color: this.color,
                    font: this.font,
                    v: 1
                });
                this.dragAction = "place";
                this.currentShapeState = "selected";
            }
            if (this.dragAction === "none") {
                this.commit(lc);
                return;
            }
            this.initialShapeBoundingRect = this.currentShape.getBoundingRect(lc.ctx);
            this.dragOffset = {
                x: x - this.initialShapeBoundingRect.x,
                y: y - this.initialShapeBoundingRect.y
            };
            this._setShapesInProgress(lc);
            return lc.repaintLayer("main");
        }
    }, {
        key: "continue",
        value: function _continue(x, y, lc) {
            var br, brBottom, brRight;
            if (this.dragAction === "none") {
                return;
            }
            br = this.initialShapeBoundingRect;
            brRight = br.x + br.width;
            brBottom = br.y + br.height;
            switch (this.dragAction) {
                case "place":
                    this.currentShape.x = x;
                    this.currentShape.y = y;
                    this.didDrag = true;
                    break;
                case "move":
                    this.currentShape.x = x - this.dragOffset.x;
                    this.currentShape.y = y - this.dragOffset.y;
                    this.didDrag = true;
                    break;
                case "resizeBottomRight":
                    this.currentShape.setSize(x - (this.dragOffset.x - this.initialShapeBoundingRect.width) - br.x, y - (this.dragOffset.y - this.initialShapeBoundingRect.height) - br.y);
                    break;
                case "resizeTopLeft":
                    this.currentShape.setSize(brRight - x + this.dragOffset.x, brBottom - y + this.dragOffset.y);
                    this.currentShape.setPosition(x - this.dragOffset.x, y - this.dragOffset.y);
                    break;
                case "resizeBottomLeft":
                    this.currentShape.setSize(brRight - x + this.dragOffset.x, y - (this.dragOffset.y - this.initialShapeBoundingRect.height) - br.y);
                    this.currentShape.setPosition(x - this.dragOffset.x, this.currentShape.y);
                    break;
                case "resizeTopRight":
                    this.currentShape.setSize(x - (this.dragOffset.x - this.initialShapeBoundingRect.width) - br.x, brBottom - y + this.dragOffset.y);
                    this.currentShape.setPosition(this.currentShape.x, y - this.dragOffset.y);
            }
            this._setShapesInProgress(lc);
            lc.repaintLayer("main");
            return this._updateInputEl(lc);
        }
    }, {
        key: "end",
        value: function end(x, y, lc) {
            if (!this.currentShape) {
                return;
            }
            this.currentShape.setSize(this.currentShape.forcedWidth, 0);
            if (this.currentShapeState === "selected") {
                if (this.dragAction === "place" || this.dragAction === "move" && !this.didDrag) {
                    this._enterEditingState(lc);
                }
            }
            this._setShapesInProgress(lc);
            lc.repaintLayer("main");
            return this._updateInputEl(lc);
        }
    }, {
        key: "_enterEditingState",
        value: function _enterEditingState(lc) {
            var onChange;
            this.currentShapeState = "editing";
            if (this.inputEl) {
                throw "State error";
            }
            this.inputEl = document.createElement("textarea");
            this.inputEl.className = "text-tool-input";
            this.inputEl.style.position = "absolute";
            this.inputEl.style.transformOrigin = "0px 0px";
            this.inputEl.style.backgroundColor = "transparent";
            this.inputEl.style.border = "none";
            this.inputEl.style.outline = "none";
            this.inputEl.style.margin = "0";
            this.inputEl.style.padding = "4px";
            this.inputEl.style.zIndex = "1000";
            this.inputEl.style.overflow = "hidden";
            this.inputEl.style.resize = "none";
            this.inputEl.value = this.currentShape.text;
            this.inputEl.addEventListener("mousedown", function (e) {
                return e.stopPropagation();
            });
            this.inputEl.addEventListener("touchstart", function (e) {
                return e.stopPropagation();
            });
            onChange = function (_this) {
                return function (e) {
                    _this.currentShape.setText(e.target.value);
                    _this.currentShape.enforceMaxBoundingRect(lc);
                    _this._setShapesInProgress(lc);
                    lc.repaintLayer("main");
                    _this._updateInputEl(lc);
                    return e.stopPropagation();
                };
            }(this);
            this.inputEl.addEventListener("keydown", function (_this) {
                return function () {
                    return _this._updateInputEl(lc, true);
                };
            }(this));
            this.inputEl.addEventListener("keyup", onChange);
            this.inputEl.addEventListener("change", onChange);
            this._updateInputEl(lc);
            lc.containerEl.appendChild(this.inputEl);
            this.inputEl.focus();
            return this._setShapesInProgress(lc);
        }
    }, {
        key: "_exitEditingState",
        value: function _exitEditingState(lc) {
            this.currentShapeState = "selected";
            lc.containerEl.removeChild(this.inputEl);
            this.inputEl = null;
            this._setShapesInProgress(lc);
            return lc.repaintLayer("main");
        }
    }, {
        key: "_updateInputEl",
        value: function _updateInputEl(lc, withMargin) {
            var br, transformString;
            if (withMargin == null) {
                withMargin = false;
            }
            if (!this.inputEl) {
                return;
            }
            br = this.currentShape.getBoundingRect(lc.ctx, true);
            this.inputEl.style.font = this.currentShape.font;
            this.inputEl.style.color = this.currentShape.color;
            this.inputEl.style.left = lc.position.x / lc.backingScale + br.x * lc.scale - 4 + "px";
            this.inputEl.style.top = lc.position.y / lc.backingScale + br.y * lc.scale - 4 + "px";
            if (withMargin && !this.currentShape.forcedWidth) {
                this.inputEl.style.width = br.width + 10 + this.currentShape.renderer.emDashWidth + "px";
            } else {
                this.inputEl.style.width = br.width + 12 + "px";
            }
            if (withMargin) {
                this.inputEl.style.height = br.height + 10 + this.currentShape.renderer.metrics.leading + "px";
            } else {
                this.inputEl.style.height = br.height + 10 + "px";
            }
            transformString = "scale(" + lc.scale + ")";
            this.inputEl.style.transform = transformString;
            this.inputEl.style.webkitTransform = transformString;
            this.inputEl.style.MozTransform = transformString;
            this.inputEl.style.msTransform = transformString;
            return this.inputEl.style.OTransform = transformString;
        }
    }]);

    return Text;
}(_base.Tool);

Text.prototype.name = "Text";
Text.prototype.iconName = "text";
Text.prototype.optionsStyle = "font";

exports.default = Text;