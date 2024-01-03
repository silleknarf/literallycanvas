'use strict';

var React = require('./React-shim');
var ReactDOM = require('./ReactDOM-shim');

var _require = require('../core/LiterallyCanvas'),
    LiterallyCanvasModel = _require.default;

var LiterallyCanvasReactComponent = require('./LiterallyCanvas');

function init(el, opts) {
  var originalClassName = el.className;
  var lc = new LiterallyCanvasModel(opts);
  ReactDOM.render(React.createElement(LiterallyCanvasReactComponent, { lc: lc }), el);
  lc.teardown = function () {
    lc._teardown();
    for (var i = 0; i < el.children.length; i++) {
      el.removeChild(el.children[i]);
    }
    el.className = originalClassName;
  };
  return lc;
}

module.exports = init;