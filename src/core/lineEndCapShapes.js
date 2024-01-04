"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var getPoints = function getPoints(x, y, angle, width, length) {
    return [{
        x: x + Math.cos(angle + Math.PI / 2) * width / 2,
        y: y + Math.sin(angle + Math.PI / 2) * width / 2
    }, {
        x: x + Math.cos(angle) * length,
        y: y + Math.sin(angle) * length
    }, {
        x: x + Math.cos(angle - Math.PI / 2) * width / 2,
        y: y + Math.sin(angle - Math.PI / 2) * width / 2
    }];
};

var arrow = {
    drawToCanvas: function drawToCanvas(ctx, x, y, angle, width, color, length) {
        if (length == null) {
            length = 0;
        }
        length = length || width;

        ctx.fillStyle = color;
        ctx.lineWidth = 0;
        ctx.strokeStyle = "transparent";
        ctx.beginPath();
        var points = getPoints(x, y, angle, width, length);

        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.fill();
    },
    svg: function svg(x, y, angle, width, color, length) {
        if (length == null) {
            length = 0;
        }
        length = length || width;
        var points = getPoints(x, y, angle, width, length);

        return "<polygon fill='" + color + "' stroke='none' points='" + points.map(function (p) {
            return p.x + "," + p.y;
        }) + "' />";
    }
};

exports.default = { arrow: arrow };