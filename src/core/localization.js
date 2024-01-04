"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var strings = {};

var localize = function localize(localStrings) {
    return strings = localStrings;
};

var _ = function _(string) {
    var translation = strings[string];
    return translation || string;
};

exports.localize = localize;
exports._ = _;