"use strict";

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

var _slicedToArray = function () {
    function sliceIterator(arr, i) {
        var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;_e = err;
        } finally {
            try {
                if (!_n && _i["return"]) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }return _arr;
    }return function (arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
}();

require("./fontmetrics.js");

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }return arr2;
    } else {
        return Array.from(arr);
    }
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var parseFontString = function parseFontString(font) {
    var fontItems = font.split(" ");

    var fontSize = 0;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = fontItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            var maybeSize = parseInt(item.replace("px", ""), 10);
            if (!isNaN(maybeSize)) {
                fontSize = maybeSize;
            }
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

    if (!fontSize) {
        throw "Font size not found";
    }

    var remainingFontString = font.substring(fontItems[0].length + 1).replace("bold ", "").replace("italic ", "").replace("underline ", "");

    var fontFamily = remainingFontString;

    return { fontSize: fontSize, fontFamily: fontFamily };
};

var getNextLine = function getNextLine(ctx, text, forcedWidth) {
    if (!text.length) {
        return ["", ""];
    }

    var endIndex = 0;
    var lastGoodIndex = 0;
    var lastOkayIndex = 0;
    var wasInWord = false;

    while (true) {
        endIndex += 1;
        var isEndOfString = endIndex >= text.length;

        var isWhitespace = !isEndOfString && text[endIndex].match(/\s/);
        var isNonWord = isWhitespace || isEndOfString;

        var textToHere = text.substring(0, endIndex);
        var doesSubstringFit = forcedWidth ? ctx.measureTextWidth(textToHere).width <= forcedWidth : true;

        if (doesSubstringFit) {
            lastOkayIndex = endIndex;
        }

        // word -> non-word
        if (isNonWord && wasInWord) {
            wasInWord = false;
            if (doesSubstringFit) {
                lastGoodIndex = endIndex;
            }
        }

        wasInWord = !isWhitespace;

        if (isEndOfString || !doesSubstringFit) {
            if (doesSubstringFit) {
                return [text, ""];
            } else if (lastGoodIndex > 0) {
                var nextWordStartIndex = lastGoodIndex + 1;
                while (nextWordStartIndex < text.length && text[nextWordStartIndex].match(/\s/)) {
                    nextWordStartIndex += 1;
                }
                return [text.substring(0, lastGoodIndex), text.substring(nextWordStartIndex)];
            } else {
                return [text.substring(0, lastOkayIndex), text.substring(lastOkayIndex)];
            }
        }
    }
};

var getLinesToRender = function getLinesToRender(ctx, text, forcedWidth) {
    var textSplitOnLines = text.split(/\r\n|\r|\n/g);

    var lines = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = textSplitOnLines[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var textLine = _step2.value;

            var _getNextLine = getNextLine(ctx, textLine, forcedWidth),
                _getNextLine2 = _slicedToArray(_getNextLine, 2),
                nextLine = _getNextLine2[0],
                remainingText = _getNextLine2[1];

            if (nextLine) {
                while (nextLine) {
                    lines.push(nextLine);

                    var _getNextLine3 = getNextLine(ctx, remainingText, forcedWidth);

                    var _getNextLine4 = _slicedToArray(_getNextLine3, 2);

                    nextLine = _getNextLine4[0];
                    remainingText = _getNextLine4[1];
                }
            } else {
                lines.push(textLine);
            }
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

    return lines;
};

var TextRenderer = function () {
    function TextRenderer(ctx, text, font, forcedWidth, forcedHeight) {
        var _this = this;

        _classCallCheck(this, TextRenderer);

        this.text = text;
        this.font = font;
        this.forcedWidth = forcedWidth;
        this.forcedHeight = forcedHeight;

        var _parseFontString = parseFontString(this.font),
            fontFamily = _parseFontString.fontFamily,
            fontSize = _parseFontString.fontSize;

        ctx.font = this.font;
        ctx.textBaseline = "baseline";
        this.emDashWidth = ctx.measureTextWidth("—", fontSize, fontFamily).width;
        this.caratWidth = ctx.measureTextWidth("|", fontSize, fontFamily).width;

        this.lines = getLinesToRender(ctx, this.text, this.forcedWidth);

        // we need to get metrics line by line and combine them. :-(
        this.metricses = this.lines.map(function (line) {
            return ctx.measureText2(line || "X", fontSize, _this.font);
        });

        this.metrics = {
            ascent: Math.max.apply(Math, _toConsumableArray(this.metricses.map(function (_ref) {
                var ascent = _ref.ascent;
                return ascent;
            }))),
            descent: Math.max.apply(Math, _toConsumableArray(this.metricses.map(function (_ref2) {
                var descent = _ref2.descent;
                return descent;
            }))),
            fontsize: Math.max.apply(Math, _toConsumableArray(this.metricses.map(function (_ref3) {
                var fontsize = _ref3.fontsize;
                return fontsize;
            }))),
            leading: Math.max.apply(Math, _toConsumableArray(this.metricses.map(function (_ref4) {
                var leading = _ref4.leading;
                return leading;
            }))),
            width: Math.max.apply(Math, _toConsumableArray(this.metricses.map(function (_ref5) {
                var width = _ref5.width;
                return width;
            }))),
            height: Math.max.apply(Math, _toConsumableArray(this.metricses.map(function (_ref6) {
                var height = _ref6.height;
                return height;
            }))),
            bounds: {
                minx: Math.min.apply(Math, _toConsumableArray(this.metricses.map(function (_ref7) {
                    var bounds = _ref7.bounds;
                    return bounds.minx;
                }))),
                miny: Math.min.apply(Math, _toConsumableArray(this.metricses.map(function (_ref8) {
                    var bounds = _ref8.bounds;
                    return bounds.miny;
                }))),
                maxx: Math.max.apply(Math, _toConsumableArray(this.metricses.map(function (_ref9) {
                    var bounds = _ref9.bounds;
                    return bounds.maxx;
                }))),
                maxy: Math.max.apply(Math, _toConsumableArray(this.metricses.map(function (_ref10) {
                    var bounds = _ref10.bounds;
                    return bounds.maxy;
                })))
            }
        };

        this.boundingBoxWidth = Math.ceil(this.metrics.width);
    }

    _createClass(TextRenderer, [{
        key: "draw",
        value: function draw(ctx, x, y) {
            ctx.textBaseline = "top";
            ctx.font = this.font;
            var i = 0;

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.lines[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var line = _step3.value;

                    ctx.fillText(line, x, y + i++ * this.metrics.leading);
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
        }
    }, {
        key: "getWidth",
        value: function getWidth(isEditing) {
            // if isEditing == true, add X padding to account for carat
            if (isEditing == null) {
                isEditing = false;
            }
            if (this.forcedWidth) {
                return this.forcedWidth;
            } else {
                if (isEditing) {
                    return this.metrics.bounds.maxx + this.caratWidth;
                } else {
                    return this.metrics.bounds.maxx;
                }
            }
        }
    }, {
        key: "getHeight",
        value: function getHeight() {
            return this.forcedHeight || this.metrics.leading * this.lines.length;
        }
    }]);

    return TextRenderer;
}();

exports.default = TextRenderer;