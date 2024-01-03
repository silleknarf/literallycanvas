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

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

// maybe add checks to these in the future to make sure you never double-undo or
// double-redo
var ClearAction = function () {
    function ClearAction(lc, oldShapes, newShapes) {
        _classCallCheck(this, ClearAction);

        this.lc = lc;
        this.oldShapes = oldShapes;
        this.newShapes = newShapes;
    }

    _createClass(ClearAction, [{
        key: "do",
        value: function _do() {
            this.lc.shapes = this.newShapes;
            this.lc.repaintLayer("main");
        }
    }, {
        key: "undo",
        value: function undo() {
            this.lc.shapes = this.oldShapes;
            this.lc.repaintLayer("main");
        }
    }]);

    return ClearAction;
}();

var MoveAction = function () {
    function MoveAction(lc, selectedShape, previousPosition, newPosition) {
        _classCallCheck(this, MoveAction);

        this.lc = lc;
        this.selectedShape = selectedShape;
        this.previousPosition = previousPosition;
        this.newPosition = newPosition;
    }

    _createClass(MoveAction, [{
        key: "do",
        value: function _do() {
            this.selectedShape.setUpperLeft({
                x: this.newPosition.x,
                y: this.newPosition.y
            });
            this.lc.repaintLayer("main");
        }
    }, {
        key: "undo",
        value: function undo() {
            this.selectedShape.setUpperLeft({
                x: this.previousPosition.x,
                y: this.previousPosition.y
            });
            this.lc.repaintLayer("main");
        }
    }]);

    return MoveAction;
}();

var AddShapeAction = function () {
    function AddShapeAction(lc, shape) {
        var previousShapeId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        _classCallCheck(this, AddShapeAction);

        this.lc = lc;
        this.shape = shape;
        this.previousShapeId = previousShapeId;
    }

    _createClass(AddShapeAction, [{
        key: "do",
        value: function _do() {
            // common case: just add it to the end
            if (!this.lc.shapes.length || this.lc.shapes[this.lc.shapes.length - 1].id === this.previousShapeId || this.previousShapeId === null) {
                this.lc.shapes.push(this.shape);
                // uncommon case: insert it somewhere
            } else {
                var newShapes = [];
                var found = false;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.lc.shapes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var shape = _step.value;

                        newShapes.push(shape);
                        if (shape.id === this.previousShapeId) {
                            newShapes.push(this.shape);
                            found = true;
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

                if (!found) {
                    // given ID doesn't exist, just shove it on top
                    newShapes.push(this.shape);
                }
                this.lc.shapes = newShapes;
            }
            this.lc.repaintLayer("main");
        }
    }, {
        key: "undo",
        value: function undo() {
            // common case: it's the most recent shape
            if (this.lc.shapes[this.lc.shapes.length - 1].id === this.shape.id) {
                this.lc.shapes.pop();
                // uncommon case: it's in the array somewhere
            } else {
                var newShapes = [];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.lc.shapes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var shape = _step2.value;

                        if (shape.id !== this.shape.id) {
                            newShapes.push(shape);
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

                this.lc.shapes = newShapes;
            }
            this.lc.repaintLayer("main");
        }
    }]);

    return AddShapeAction;
}();

exports.ClearAction = ClearAction;
exports.MoveAction = MoveAction;
exports.AddShapeAction = AddShapeAction;