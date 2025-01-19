var React;

try {
  React = require('react');
} catch (error) {
  React = window.React;
}

if (React == null) {
  throw "Can't find React";
}

var slice = [].slice;

module.exports = React;

module.exports.createFactory = function(component) {
  return function(props) {
    var children;
    if (props == null) {
      props = {};
    }
    children = 1 <= arguments.length ? slice.call(arguments, 1) : [];
    return React.createElement.apply(React, [component, props].concat(children));
  };
};
