"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Pencil = require("./tools/Pencil");

var _Pencil2 = _interopRequireDefault(_Pencil);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var defaultOptions = {
    imageURLPrefix: "lib/img",
    primaryColor: "hsla(0, 0%, 0%, 1)",
    secondaryColor: "hsla(0, 0%, 100%, 1)",
    backgroundColor: "transparent",
    strokeWidths: [1, 2, 5, 10, 20, 30],
    defaultStrokeWidth: 5,
    toolbarPosition: "top",
    keyboardShortcuts: false,
    imageSize: { width: "infinite", height: "infinite" },
    backgroundShapes: [],
    watermarkImage: null,
    watermarkScale: 1,
    zoomMin: 0.2,
    zoomMax: 4.0,
    zoomStep: 0.2,
    snapshot: null,
    onInit: function onInit() {},
    tools: [_Pencil2.default]
};

exports.default = defaultOptions;