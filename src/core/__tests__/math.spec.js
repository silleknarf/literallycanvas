"use strict";

var _math = require("../math");

var _math2 = _interopRequireDefault(_math);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("math", function () {
    it("should define length function", function () {
        expect(_math2.default.len({ x: 3, y: 4 })).toBe(5);
    });

    it("should define diff function", function () {
        expect(_math2.default.diff({ x: 3, y: 4 }, { x: 3, y: 4 })).toEqual({ x: 0, y: 0 });
        expect(_math2.default.diff({ x: 1, y: 4 }, { x: 3, y: 4 })).toEqual({ x: 2, y: 0 });
        expect(_math2.default.diff({ x: 3, y: 2 }, { x: 3, y: 4 })).toEqual({ x: 0, y: 2 });
        expect(_math2.default.diff({ x: 10, y: 10 }, { x: 3, y: 4 })).toEqual({ x: -7, y: -6 });
    });
});