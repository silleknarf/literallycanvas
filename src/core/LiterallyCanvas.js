"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _actions = require("./actions");

var actions = _interopRequireWildcard(_actions);

var _bindEvents = require("./bindEvents");

var _bindEvents2 = _interopRequireDefault(_bindEvents);

var _shapes = require("./shapes");

var _canvasRenderer = require("./canvasRenderer");

var _defaultOptions = require("./defaultOptions");

var _defaultOptions2 = _interopRequireDefault(_defaultOptions);

var _renderSnapshotToImage = require("./renderSnapshotToImage");

var _renderSnapshotToImage2 = _interopRequireDefault(_renderSnapshotToImage);

var _renderSnapshotToSVG = require("./renderSnapshotToSVG");

var _renderSnapshotToSVG2 = _interopRequireDefault(_renderSnapshotToSVG);

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INFINITE = "infinite";

var LiterallyCanvas = function () {
    function LiterallyCanvas(arg1, arg2) {
        _classCallCheck(this, LiterallyCanvas);

        this.setImageSize = this.setImageSize.bind(this);
        var opts = null;
        var containerEl = null;
        if (arg1 instanceof HTMLElement) {
            containerEl = arg1;
            opts = arg2;
        } else {
            opts = arg1;
        }

        this.opts = opts || {};

        this.config = {
            zoomMin: opts.zoomMin || 0.2,
            zoomMax: opts.zoomMax || 4.0,
            zoomStep: opts.zoomStep || 0.2
        };

        this.colors = {
            primary: opts.primaryColor || "#000",
            secondary: opts.secondaryColor || "#fff",
            background: opts.backgroundColor || "transparent"
        };

        this.watermarkImage = opts.watermarkImage;
        this.watermarkScale = opts.watermarkScale || 1;

        this.backgroundCanvas = document.createElement("canvas");
        this.backgroundCtx = this.backgroundCanvas.getContext("2d");

        this.canvas = document.createElement("canvas");
        this.canvas.style["background-color"] = "transparent";

        this.buffer = document.createElement("canvas");
        this.buffer.style["background-color"] = "transparent";
        this.ctx = this.canvas.getContext("2d");
        this.bufferCtx = this.buffer.getContext("2d");

        this.backingScale = (0, _util.getBackingScale)(this.ctx);

        this.backgroundShapes = opts.backgroundShapes || [];
        this._shapesInProgress = [];
        this.shapes = [];
        this.undoStack = [];
        this.redoStack = [];

        this.isDragging = false;
        this.position = { x: 0, y: 0 };
        this.scale = 1.0;
        // GUI immediately replaces this value, but it's initialized so you can have
        // something really simple
        this.setTool(new this.opts.tools[0](this));

        this.width = opts.imageSize.width || INFINITE;
        this.height = opts.imageSize.height || INFINITE;

        // This will ensure that we are zoomed to @scale, panned to @position, and
        // that all layers are repainted.
        this.setZoom(this.scale);

        if (opts.snapshot) {
            this.loadSnapshot(opts.snapshot);
        }

        this.isBound = false;
        if (containerEl) {
            this.bindToElement(containerEl);
        }

        this.respondToSizeChange = function () {};
    }

    _createClass(LiterallyCanvas, [{
        key: "bindToElement",
        value: function bindToElement(containerEl) {
            var _this = this;

            if (this.containerEl) {
                console.warn("Trying to bind Literally Canvas to a DOM element more than once is unsupported.");
                return;
            }

            this.containerEl = containerEl;
            this._unsubscribeEvents = (0, _bindEvents2.default)(this, this.containerEl, this.opts.keyboardShortcuts);
            this.containerEl.style["background-color"] = this.colors.background;
            this.containerEl.appendChild(this.backgroundCanvas);
            this.containerEl.appendChild(this.canvas);

            this.isBound = true;

            var repaintAll = function repaintAll() {
                _this.keepPanInImageBounds();
                _this.repaintAllLayers();
            };

            this.respondToSizeChange = (0, _util.matchElementSize)(this.containerEl, [this.backgroundCanvas, this.canvas], this.backingScale, repaintAll);

            if (this.watermarkImage) {
                this.watermarkImage.onload = function () {
                    return _this.repaintLayer("background");
                };
            }

            if (this.tool != null) {
                this.tool.didBecomeActive(this);
            }

            repaintAll();
        }
    }, {
        key: "_teardown",
        value: function _teardown() {
            if (this.tool != null) {
                this.tool.willBecomeInactive(this);
            }
            if (typeof this._unsubscribeEvents === "function") {
                this._unsubscribeEvents();
            }
            this.tool = null;
            this.containerEl = null;
            this.isBound = false;
        }
    }, {
        key: "trigger",
        value: function trigger(name, data) {
            this.canvas.dispatchEvent(new CustomEvent(name, { detail: data }));
            // dispatchEvent has a boolean value that doesn't mean anything to us, so
            // don't let CoffeeScript send it back
            return null;
        }
    }, {
        key: "on",
        value: function on(name, fn) {
            var _this2 = this;

            var wrapper = function wrapper(e) {
                return fn(e.detail);
            };
            this.canvas.addEventListener(name, wrapper);
            return function () {
                _this2.canvas.removeEventListener(name, wrapper);
            };
        }

        // actual ratio of drawing-space pixels to perceived pixels, accounting for
        // both zoom and displayPixelWidth. use this when converting between
        // drawing-space and screen-space.

    }, {
        key: "getRenderScale",
        value: function getRenderScale() {
            return this.scale * this.backingScale;
        }
    }, {
        key: "clientCoordsToDrawingCoords",
        value: function clientCoordsToDrawingCoords(x, y) {
            return {
                x: (x * this.backingScale - this.position.x) / this.getRenderScale(),
                y: (y * this.backingScale - this.position.y) / this.getRenderScale()
            };
        }
    }, {
        key: "drawingCoordsToClientCoords",
        value: function drawingCoordsToClientCoords(x, y) {
            return {
                x: x * this.getRenderScale() + this.position.x,
                y: y * this.getRenderScale() + this.position.y
            };
        }
    }, {
        key: "setImageSize",
        value: function setImageSize(width, height) {
            this.width = width || INFINITE;
            this.height = height || INFINITE;
            this.keepPanInImageBounds();
            this.repaintAllLayers();
            this.trigger("imageSizeChange", {
                width: this.width,
                height: this.height
            });
        }
    }, {
        key: "setTool",
        value: function setTool(tool) {
            if (this.isBound) {
                if (this.tool != null) {
                    this.tool.willBecomeInactive(this);
                }
            }
            this.tool = tool;
            this.trigger("toolChange", { tool: tool });
            if (this.isBound) {
                this.tool.didBecomeActive(this);
            }
        }
    }, {
        key: "setShapesInProgress",
        value: function setShapesInProgress(newVal) {
            this._shapesInProgress = newVal;
        }
    }, {
        key: "pointerDown",
        value: function pointerDown(x, y) {
            var p = this.clientCoordsToDrawingCoords(x, y);
            if (!this.tool) {
                return null;
            }
            if (this.tool.usesSimpleAPI) {
                this.tool.begin(p.x, p.y, this);
                this.isDragging = true;
                this.trigger("drawStart", { tool: this.tool });
            } else {
                this.isDragging = true;
                this.trigger("lc-pointerdown", {
                    tool: this.tool,
                    x: p.x,
                    y: p.y,
                    rawX: x,
                    rawY: y
                });
            }
        }
    }, {
        key: "pointerMove",
        value: function pointerMove(x, y) {
            var _this3 = this;

            // FIXME: requestAnimationFrame returns a value to be used in order to
            // cancel animationFrame when it is no longer required...
            (0, _util.requestAnimationFrame)(function () {
                var p = _this3.clientCoordsToDrawingCoords(x, y);
                if (_this3.tool != null ? _this3.tool.usesSimpleAPI : undefined) {
                    if (_this3.isDragging) {
                        _this3.tool.continue(p.x, p.y, _this3);
                        _this3.trigger("drawContinue", { tool: _this3.tool });
                    }
                } else {
                    if (_this3.isDragging) {
                        _this3.trigger("lc-pointerdrag", {
                            tool: _this3.tool,
                            x: p.x,
                            y: p.y,
                            rawX: x,
                            rawY: y
                        });
                    } else {
                        _this3.trigger("lc-pointermove", {
                            tool: _this3.tool,
                            x: p.x,
                            y: p.y,
                            rawX: x,
                            rawY: y
                        });
                    }
                }
            });
        }
    }, {
        key: "pointerUp",
        value: function pointerUp(x, y) {
            var p = this.clientCoordsToDrawingCoords(x, y);
            if (!this.tool) {
                return null;
            }
            if (this.tool.usesSimpleAPI) {
                if (this.isDragging) {
                    this.tool.end(p.x, p.y, this);
                    this.isDragging = false;
                    this.trigger("drawEnd", { tool: this.tool });
                }
            } else {
                this.isDragging = false;
                this.trigger("lc-pointerup", {
                    tool: this.tool,
                    x: p.x,
                    y: p.y,
                    rawX: x,
                    rawY: y
                });
            }
        }
    }, {
        key: "setColor",
        value: function setColor(name, color) {
            this.colors[name] = color;
            if (!this.isBound) {
                return;
            }
            switch (name) {
                case "background":
                    this.containerEl.style.backgroundColor = this.colors.background;
                    this.repaintLayer("background");
                    break;
                case "primary":
                    this.repaintLayer("main");
                    break;
                case "secondary":
                    this.repaintLayer("main");
                    break;
            }
            this.trigger(name + "ColorChange", this.colors[name]);
            if (name === "background") {
                this.trigger("drawingChange");
            }
        }
    }, {
        key: "getColor",
        value: function getColor(name) {
            return this.colors[name];
        }
    }, {
        key: "saveShape",
        value: function saveShape(shape, triggerShapeSaveEvent) {
            var previousShapeId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            if (triggerShapeSaveEvent == null) {
                triggerShapeSaveEvent = true;
            }
            if (!previousShapeId) {
                previousShapeId = this.shapes.length ? this.shapes[this.shapes.length - 1].id : null;
            }
            this.execute(new actions.AddShapeAction(this, shape, previousShapeId));
            if (triggerShapeSaveEvent) {
                this.trigger("shapeSave", { shape: shape, previousShapeId: previousShapeId });
            }
            this.trigger("drawingChange");
        }
    }, {
        key: "pan",
        value: function pan(x, y) {
            // Subtract because we are moving the viewport
            this.setPan(this.position.x - x, this.position.y - y);
        }
    }, {
        key: "keepPanInImageBounds",
        value: function keepPanInImageBounds() {
            var renderScale = this.getRenderScale();
            var _position = this.position,
                x = _position.x,
                y = _position.y;


            if (this.width !== INFINITE) {
                if (this.canvas.width > this.width * renderScale) {
                    x = (this.canvas.width - this.width * renderScale) / 2;
                } else {
                    x = Math.max(Math.min(0, x), this.canvas.width - this.width * renderScale);
                }
            }

            if (this.height !== INFINITE) {
                if (this.canvas.height > this.height * renderScale) {
                    y = (this.canvas.height - this.height * renderScale) / 2;
                } else {
                    y = Math.max(Math.min(0, y), this.canvas.height - this.height * renderScale);
                }
            }

            this.position = { x: x, y: y };
        }
    }, {
        key: "setPan",
        value: function setPan(x, y) {
            this.position = { x: x, y: y };
            this.keepPanInImageBounds();
            this.repaintAllLayers();
            this.trigger("pan", { x: this.position.x, y: this.position.y });
        }
    }, {
        key: "zoom",
        value: function zoom(factor) {
            var newScale = this.scale + factor;
            newScale = Math.max(newScale, this.config.zoomMin);
            newScale = Math.min(newScale, this.config.zoomMax);
            newScale = Math.round(newScale * 100) / 100;
            this.setZoom(newScale);
        }
    }, {
        key: "setZoom",
        value: function setZoom(scale) {
            var center = this.clientCoordsToDrawingCoords(this.canvas.width / 2, this.canvas.height / 2);
            var oldScale = this.scale;
            this.scale = scale;

            this.position.x = this.canvas.width / 2 * this.backingScale - center.x * this.getRenderScale();
            this.position.y = this.canvas.height / 2 * this.backingScale - center.y * this.getRenderScale();

            this.keepPanInImageBounds();

            this.repaintAllLayers();
            this.trigger("zoom", { oldScale: oldScale, newScale: this.scale });
        }
    }, {
        key: "setWatermarkImage",
        value: function setWatermarkImage(newImage) {
            var _this4 = this;

            this.watermarkImage = newImage;
            (0, _util.addImageOnload)(newImage, function () {
                return _this4.repaintLayer("background");
            });
            if (newImage.width) {
                this.repaintLayer("background");
            }
        }
    }, {
        key: "repaintAllLayers",
        value: function repaintAllLayers() {
            var _arr = ["background", "main"];

            for (var _i = 0; _i < _arr.length; _i++) {
                var key = _arr[_i];
                this.repaintLayer(key);
            }
            return null;
        }

        // Repaints the canvas.
        // If dirty is true then all saved shapes are completely redrawn,
        // otherwise the back buffer is simply copied to the screen as is.

    }, {
        key: "repaintLayer",
        value: function repaintLayer(repaintLayerKey, dirty) {
            var _this5 = this;

            if (dirty == null) {
                dirty = repaintLayerKey === "main";
            }
            if (!this.isBound) {
                return;
            }
            switch (repaintLayerKey) {
                case "background":
                    this.backgroundCtx.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
                    var retryCallback = function retryCallback() {
                        return _this5.repaintLayer("background");
                    };
                    if (this.watermarkImage) {
                        this._renderWatermark(this.backgroundCtx, true, retryCallback);
                    }
                    this.draw(this.backgroundShapes, this.backgroundCtx, retryCallback);
                    break;
                case "main":
                    retryCallback = function retryCallback() {
                        return _this5.repaintLayer("main", true);
                    };
                    if (dirty) {
                        this.buffer.width = this.canvas.width;
                        this.buffer.height = this.canvas.height;
                        this.bufferCtx.clearRect(0, 0, this.buffer.width, this.buffer.height);
                        this.draw(this.shapes, this.bufferCtx, retryCallback);
                    }
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    if (this.canvas.width > 0 && this.canvas.height > 0) {
                        this.ctx.fillStyle = "#ccc";
                        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                        this.clipped(function () {
                            _this5.ctx.clearRect(0, 0, _this5.canvas.width, _this5.canvas.height);
                            _this5.ctx.drawImage(_this5.buffer, 0, 0);
                        }, this.ctx);

                        this.clipped(function () {
                            _this5.transformed(function () {
                                _this5._shapesInProgress.map(function (shape) {
                                    return (0, _canvasRenderer.renderShapeToContext)(_this5.ctx, shape, {
                                        bufferCtx: _this5.bufferCtx,
                                        shouldOnlyDrawLatest: true
                                    });
                                });
                            }, _this5.ctx, _this5.bufferCtx);
                        }, this.ctx, this.bufferCtx);
                    }
                    break;
            }

            this.trigger("repaint", { layerKey: repaintLayerKey });
        }
    }, {
        key: "_renderWatermark",
        value: function _renderWatermark(ctx, worryAboutRetina, retryCallback) {
            if (worryAboutRetina == null) {
                worryAboutRetina = true;
            }
            if (!this.watermarkImage.width) {
                this.watermarkImage.onload = retryCallback;
                return;
            }

            ctx.save();
            ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
            ctx.scale(this.watermarkScale, this.watermarkScale);
            if (worryAboutRetina) {
                ctx.scale(this.backingScale, this.backingScale);
            }
            ctx.drawImage(this.watermarkImage, -this.watermarkImage.width / 2, -this.watermarkImage.height / 2);
            ctx.restore();
        }

        // Redraws the back buffer to the screen in its current state
        // then draws the given shape translated and scaled on top of that.
        // This is used for updating a shape while it is being drawn
        // without doing a full repaint.
        // The context is restored to its original state before returning.

    }, {
        key: "drawShapeInProgress",
        value: function drawShapeInProgress(shape) {
            var _this6 = this;

            this.repaintLayer("main", false);
            this.clipped(function () {
                _this6.transformed(function () {
                    (0, _canvasRenderer.renderShapeToContext)(_this6.ctx, shape, {
                        bufferCtx: _this6.bufferCtx,
                        shouldOnlyDrawLatest: true
                    });
                }, _this6.ctx, _this6.bufferCtx);
            }, this.ctx, this.bufferCtx);
        }

        // Draws the given shapes translated and scaled to the given context.
        // The context is restored to its original state before returning.

    }, {
        key: "draw",
        value: function draw(shapes, ctx, retryCallback) {
            var _this7 = this;

            if (!shapes.length) {
                return;
            }
            var drawShapes = function drawShapes() {
                shapes.map(function (shape) {
                    return (0, _canvasRenderer.renderShapeToContext)(ctx, shape, { retryCallback: retryCallback });
                });
            };
            this.clipped(function () {
                return _this7.transformed(drawShapes, ctx);
            }, ctx);
        }

        // Executes the given function after clipping the canvas to the image size.
        // The context is restored to its original state before returning.
        // This should not be called inside an @transformed block.

    }, {
        key: "clipped",
        value: function clipped(fn) {
            var x = this.width === INFINITE ? 0 : this.position.x;
            var y = this.height === INFINITE ? 0 : this.position.y;
            var width = this.width === INFINITE ? this.canvas.width : this.width * this.getRenderScale();
            var height = this.height === INFINITE ? this.canvas.height : this.height * this.getRenderScale();

            for (var _len = arguments.length, contexts = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                contexts[_key - 1] = arguments[_key];
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = contexts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var ctx = _step.value;

                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(x, y, width, height);
                    ctx.clip();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            fn();

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = contexts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    ctx = _step2.value;

                    ctx.restore();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }

        // Executes the given function after translating and scaling the context.
        // The context is restored to its original state before returning.

    }, {
        key: "transformed",
        value: function transformed(fn) {
            for (var _len2 = arguments.length, contexts = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                contexts[_key2 - 1] = arguments[_key2];
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = contexts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var ctx = _step3.value;

                    ctx.save();
                    ctx.translate(Math.floor(this.position.x), Math.floor(this.position.y));
                    var scale = this.getRenderScale();
                    ctx.scale(scale, scale);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            fn();

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = contexts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    ctx = _step4.value;

                    ctx.restore();
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    }, {
        key: "clear",
        value: function clear(triggerClearEvent) {
            if (triggerClearEvent == null) {
                triggerClearEvent = true;
            }
            var oldShapes = this.shapes;
            var newShapes = [];
            this.setShapesInProgress([]);
            this.execute(new actions.ClearAction(this, oldShapes, newShapes));
            this.repaintLayer("main");
            if (triggerClearEvent) {
                this.trigger("clear", null);
            }
            this.trigger("drawingChange", {});
        }
    }, {
        key: "execute",
        value: function execute(action) {
            this.undoStack.push(action);
            action.do();
            this.redoStack = [];
        }
    }, {
        key: "undo",
        value: function undo() {
            if (!this.undoStack.length) {
                return;
            }
            var action = this.undoStack.pop();
            action.undo();
            this.redoStack.push(action);
            this.trigger("undo", { action: action });
            this.trigger("drawingChange", {});
        }
    }, {
        key: "redo",
        value: function redo() {
            if (!this.redoStack.length) {
                return;
            }
            var action = this.redoStack.pop();
            this.undoStack.push(action);
            action.do();
            this.trigger("redo", { action: action });
            this.trigger("drawingChange", {});
        }
    }, {
        key: "canUndo",
        value: function canUndo() {
            return !!this.undoStack.length;
        }
    }, {
        key: "canRedo",
        value: function canRedo() {
            return !!this.redoStack.length;
        }
    }, {
        key: "getPixel",
        value: function getPixel(x, y) {
            var p = this.drawingCoordsToClientCoords(x, y);
            var pixel = this.ctx.getImageData(p.x, p.y, 1, 1).data;
            if (pixel[3]) {
                return "rgb(" + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ")";
            } else {
                return null;
            }
        }
    }, {
        key: "getContentBounds",
        value: function getContentBounds() {
            return (0, _util.getBoundingRect)(this.shapes.concat(this.backgroundShapes).map(function (s) {
                return s.getBoundingRect();
            }), this.width === INFINITE ? 0 : this.width, this.height === INFINITE ? 0 : this.height);
        }
    }, {
        key: "getDefaultImageRect",
        value: function getDefaultImageRect(explicitSize, margin) {
            var _this8 = this;

            if (explicitSize == null) {
                explicitSize = { width: 0, height: 0 };
            }
            if (margin == null) {
                margin = { top: 0, right: 0, bottom: 0, left: 0 };
            }
            return (0, _util.getDefaultImageRect)(this.shapes.concat(this.backgroundShapes).map(function (s) {
                return s.getBoundingRect(_this8.ctx);
            }), explicitSize, margin);
        }
    }, {
        key: "getImage",
        value: function getImage(opts) {
            if (opts == null) {
                opts = {};
            }
            if (opts.includeWatermark == null) {
                opts.includeWatermark = true;
            }
            if (opts.scaleDownRetina == null) {
                opts.scaleDownRetina = true;
            }
            if (opts.scale == null) {
                opts.scale = 1;
            }
            if (!opts.scaleDownRetina) {
                opts.scale *= this.backingScale;
            }

            if (opts.includeWatermark) {
                opts.watermarkImage = this.watermarkImage;
                opts.watermarkScale = this.watermarkScale;
                if (!opts.scaleDownRetina) {
                    opts.watermarkScale *= this.backingScale;
                }
            }
            return (0, _renderSnapshotToImage2.default)(this.getSnapshot(), opts);
        }
    }, {
        key: "canvasForExport",
        value: function canvasForExport() {
            this.repaintAllLayers();
            return (0, _util.combineCanvases)(this.backgroundCanvas, this.canvas);
        }
    }, {
        key: "canvasWithBackground",
        value: function canvasWithBackground(backgroundImageOrCanvas) {
            return (0, _util.combineCanvases)(backgroundImageOrCanvas, this.canvasForExport());
        }
    }, {
        key: "getSnapshot",
        value: function getSnapshot() {
            var keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (keys == null) {
                keys = ["shapes", "imageSize", "colors", "position", "scale", "backgroundShapes"];
            }
            var snapshot = {};
            var _arr2 = ["colors", "position", "scale"];
            for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
                var k = _arr2[_i2];
                if (keys.indexOf(k) >= 0) {
                    snapshot[k] = this[k];
                }
            }
            if (keys.indexOf("shapes") >= 0) {
                snapshot.shapes = this.shapes.map(function (shape) {
                    return (0, _shapes.shapeToJSON)(shape);
                });
            }
            if (keys.indexOf("backgroundShapes") >= 0) {
                snapshot.backgroundShapes = this.backgroundShapes.map(function (shape) {
                    return (0, _shapes.shapeToJSON)(shape);
                });
            }
            if (keys.indexOf("imageSize") >= 0) {
                snapshot.imageSize = { width: this.width, height: this.height };
            }

            return snapshot;
        }
    }, {
        key: "getSnapshotJSON",
        value: function getSnapshotJSON() {
            console.warn("lc.getSnapshotJSON() is deprecated. use JSON.stringify(lc.getSnapshot()) instead.");
            return JSON.stringify(this.getSnapshot());
        }
    }, {
        key: "getSVGString",
        value: function getSVGString(opts) {
            if (opts == null) {
                opts = {};
            }
            return (0, _renderSnapshotToSVG2.default)(this.getSnapshot(), opts);
        }
    }, {
        key: "loadSnapshot",
        value: function loadSnapshot(snapshot) {
            if (!snapshot) {
                return;
            }

            if (snapshot.colors) {
                var _arr3 = ["primary", "secondary", "background"];

                for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
                    var k = _arr3[_i3];
                    this.setColor(k, snapshot.colors[k]);
                }
            }

            if (snapshot.shapes) {
                // reset shapes
                this.shapes = [];
                // reset undostack aswell when loading a snapshot
                this.undostack = [];

                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = snapshot.shapes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var shapeRepr = _step5.value;

                        var shape = (0, _shapes.JSONToShape)(shapeRepr);
                        if (shape) {
                            this.execute(new actions.AddShapeAction(this, shape));
                        }
                    }
                } catch (err) {
                    _didIteratorError5 = true;
                    _iteratorError5 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }
                    } finally {
                        if (_didIteratorError5) {
                            throw _iteratorError5;
                        }
                    }
                }
            }

            if (snapshot.backgroundShapes) {
                this.backgroundShapes = snapshot.backgroundShapes.map(function (s) {
                    return (0, _shapes.JSONToShape)(s);
                });
            }

            if (snapshot.imageSize) {
                this.width = snapshot.imageSize.width;
                this.height = snapshot.imageSize.height;
            }

            if (snapshot.position) {
                this.position = snapshot.position;
            }
            if (snapshot.scale) {
                this.scale = snapshot.scale;
            }

            this.repaintAllLayers();
            this.trigger("snapshotLoad");
            this.trigger("drawingChange", {});
        }
    }, {
        key: "loadSnapshotJSON",
        value: function loadSnapshotJSON(str) {
            console.warn("lc.loadSnapshotJSON() is deprecated. use lc.loadSnapshot(JSON.parse(snapshot)) instead.");
            this.loadSnapshot(JSON.parse(str));
        }
    }]);

    return LiterallyCanvas;
}();

LiterallyCanvas.defaultOptions = _defaultOptions2.default;

exports.default = LiterallyCanvas;