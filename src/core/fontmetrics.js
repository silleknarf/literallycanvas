"use strict";

/**
  This library rewrites the Canvas2D "measureText" function
  so that it returns a more complete metrics object.
  This library is licensed under the MIT (Expat) license,
  the text for which is included below.

** -----------------------------------------------------------------------------

  CHANGELOG:

    2012-01-21 - Whitespace handling added by Joe Turner
                 (https://github.com/oampo)

    2015-06-08 - Various hacks added by Steve Johnson

** -----------------------------------------------------------------------------

  Copyright (C) 2011 by Mike "Pomax" Kamermans

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
**/
(function () {
    var NAME = "FontMetrics Library";
    var VERSION = "1-2012.0121.1300";

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;"
    };

    function escapeHTML(string) {
        return String(string).replace(/[&<>"'`=/]/g, function (s) {
            return entityMap[s];
        });
    }

    // if there is no getComputedStyle, this library won't work.
    if (!document.defaultView.getComputedStyle) {
        throw "ERROR: 'document.defaultView.getComputedStyle' not found. This library only works in browsers that can report computed CSS values.";
    }

    // store the old text metrics function on the Canvas2D prototype
    CanvasRenderingContext2D.prototype.measureTextWidth = CanvasRenderingContext2D.prototype.measureText;

    /**
     *  shortcut function for getting computed CSS values
     */
    var getCSSValue = function getCSSValue(element, property) {
        return document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
    };

    // debug function
    var show = function show(canvas, ctx, xstart, w, h, metrics) {
        document.body.appendChild(canvas);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";

        ctx.beginPath();
        ctx.moveTo(xstart, 0);
        ctx.lineTo(xstart, h);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xstart + metrics.bounds.maxx, 0);
        ctx.lineTo(xstart + metrics.bounds.maxx, h);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, h / 2 - metrics.ascent);
        ctx.lineTo(w, h / 2 - metrics.ascent);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, h / 2 + metrics.descent);
        ctx.lineTo(w, h / 2 + metrics.descent);
        ctx.closePath();
        ctx.stroke();
    };

    /**
     * The new text metrics function
     */
    CanvasRenderingContext2D.prototype.measureText2 = function (textstring, fontSize, fontString) {
        var metrics = this.measureTextWidth(textstring),
            isSpace = !/\S/.test(textstring);
        metrics.fontsize = fontSize;

        // for text lead values, we meaure a multiline text container.
        var leadDiv = document.createElement("div");
        leadDiv.style.position = "absolute";
        leadDiv.style.opacity = 0;
        leadDiv.style.font = fontString;
        leadDiv.innerHTML = escapeHTML(textstring) + "<br/>" + escapeHTML(textstring);
        document.body.appendChild(leadDiv);

        // make some initial guess at the text leading (using the standard TeX ratio)
        metrics.leading = 1.2 * fontSize;

        // then we try to get the real value from the browser
        var leadDivHeight = getCSSValue(leadDiv, "height");
        leadDivHeight = leadDivHeight.replace("px", "");
        if (leadDivHeight >= fontSize * 2) {
            metrics.leading = leadDivHeight / 2 | 0;
        }
        document.body.removeChild(leadDiv);

        // if we're not dealing with white space, we can compute metrics
        if (!isSpace) {
            // Have characters, so measure the text
            var canvas = document.createElement("canvas");
            var padding = 100;
            canvas.width = metrics.width + padding;
            canvas.height = 3 * fontSize;
            canvas.style.opacity = 1;
            canvas.style.font = fontString;
            var ctx = canvas.getContext("2d");
            ctx.font = fontString;

            var w = canvas.width,
                h = canvas.height,
                baseline = h / 2;

            // Set all canvas pixeldata values to 255, with all the content
            // data being 0. This lets us scan for data[i] != 255.
            ctx.fillStyle = "white";
            ctx.fillRect(-1, -1, w + 2, h + 2);
            ctx.fillStyle = "black";
            ctx.fillText(textstring, padding / 2, baseline);
            var pixelData = ctx.getImageData(0, 0, w, h).data;

            // canvas pixel data is w*4 by h*4, because R, G, B and A are separate,
            // consecutive values in the array, rather than stored as 32 bit ints.
            var i = 0,
                w4 = w * 4,
                len = pixelData.length;

            // Finding the ascent uses a normal, forward scanline
            while (++i < len && pixelData[i] === 255) {}
            var ascent = i / w4 | 0;

            // Finding the descent uses a reverse scanline
            i = len - 1;
            while (--i > 0 && pixelData[i] === 255) {}
            var descent = i / w4 | 0;

            // find the min-x coordinate
            for (i = 0; i < len && pixelData[i] === 255;) {
                i += w4;
                if (i >= len) {
                    i = i - len + 4;
                }
            }
            var minx = i % w4 / 4 | 0;

            // find the max-x coordinate
            var step = 1;
            for (i = len - 3; i >= 0 && pixelData[i] === 255;) {
                i -= w4;
                if (i < 0) {
                    i = len - 3 - step++ * 4;
                }
            }
            var maxx = i % w4 / 4 + 1 | 0;

            // set font metrics
            metrics.ascent = baseline - ascent;
            metrics.descent = descent - baseline;
            metrics.bounds = {
                minx: minx - padding / 2,
                maxx: maxx - padding / 2,
                miny: 0,
                maxy: descent - ascent
            };
            metrics.height = 1 + (descent - ascent);
        }

        // if we ARE dealing with whitespace, most values will just be zero.
        else {
                // Only whitespace, so we can't measure the text
                metrics.ascent = 0;
                metrics.descent = 0;
                metrics.bounds = {
                    minx: 0,
                    maxx: metrics.width, // Best guess
                    miny: 0,
                    maxy: 0
                };
                metrics.height = 0;
            }
        return metrics;
    };
})();