"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }return arr2;
    } else {
        return Array.from(arr);
    }
}

var coordsForTouchEvent = function coordsForTouchEvent(el, e) {
    var tx = e.changedTouches[0].clientX;
    var ty = e.changedTouches[0].clientY;
    var p = el.getBoundingClientRect();
    return [tx - p.left, ty - p.top];
};

var position = function position(el, e) {
    var p = el.getBoundingClientRect();
    return {
        left: e.clientX - p.left,
        top: e.clientY - p.top
    };
};

var buttonIsDown = function buttonIsDown(e) {
    if (e.buttons != null) {
        return e.buttons === 1;
    } else {
        return e.which > 0;
    }
};

var bindEvents = function bindEvents(lc, canvas, panWithKeyboard) {
    if (panWithKeyboard == null) {
        panWithKeyboard = false;
    }
    var unsubs = [];

    var mouseMoveListener = function mouseMoveListener(e) {
        e.preventDefault();
        var p = position(canvas, e);
        lc.pointerMove(p.left, p.top);
    };

    var mouseUpListener = function mouseUpListener(e) {
        e.preventDefault();
        canvas.onselectstart = function () {
            return true;
        }; // enable selection while dragging
        var p = position(canvas, e);
        lc.pointerUp(p.left, p.top);
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);

        canvas.addEventListener("mousemove", mouseMoveListener);
    };

    canvas.addEventListener("mousedown", function (e) {
        if (e.target.tagName.toLowerCase() !== "canvas") {
            return;
        }

        var down = true;
        e.preventDefault();
        canvas.onselectstart = function () {
            return false;
        }; // disable selection while dragging
        var p = position(canvas, e);
        lc.pointerDown(p.left, p.top);

        canvas.removeEventListener("mousemove", mouseMoveListener);
        document.addEventListener("mousemove", mouseMoveListener);
        document.addEventListener("mouseup", mouseUpListener);
    });

    var touchMoveListener = function touchMoveListener(e) {
        e.preventDefault();
        lc.pointerMove.apply(lc, _toConsumableArray(coordsForTouchEvent(canvas, e)));
    };

    var touchEndListener = function touchEndListener(e) {
        e.preventDefault();
        lc.pointerUp.apply(lc, _toConsumableArray(coordsForTouchEvent(canvas, e)));
        document.removeEventListener("touchmove", touchMoveListener);
        document.removeEventListener("touchend", touchEndListener);
        document.removeEventListener("touchcancel", touchEndListener);
    };

    canvas.addEventListener("touchstart", function (e) {
        if (e.target.tagName.toLowerCase() !== "canvas") {
            return;
        }
        e.preventDefault();
        if (e.touches.length === 1) {
            lc.pointerDown.apply(lc, _toConsumableArray(coordsForTouchEvent(canvas, e)));
            document.addEventListener("touchmove", touchMoveListener);
            document.addEventListener("touchend", touchEndListener);
            document.addEventListener("touchcancel", touchEndListener);
        } else {
            lc.pointerMove.apply(lc, _toConsumableArray(coordsForTouchEvent(canvas, e)));
        }
    });

    if (panWithKeyboard) {
        console.warn("Keyboard panning is deprecated.");
        var listener = function listener(e) {
            switch (e.keyCode) {
                case 37:
                    lc.pan(-10, 0);
                    break;
                case 38:
                    lc.pan(0, -10);
                    break;
                case 39:
                    lc.pan(10, 0);
                    break;
                case 40:
                    lc.pan(0, 10);
                    break;
            }
            lc.repaintAllLayers();
        };

        document.addEventListener("keydown", listener);
        unsubs.push(function () {
            return document.removeEventListener(listener);
        });
    }

    return function () {
        return unsubs.map(function (f) {
            return f();
        });
    };
};

exports.default = bindEvents;