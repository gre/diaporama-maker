var GlslTransitionValidator = require("glsl-transition-validator");

function createRandomCanvas (w, h) {
  var c = document.createElement("canvas");
  var ctx = c.getContext("2d");
  var d = ctx.getImageData(0,0,w,h);
  for (var p=0; p<4*w*h; p += 4) {
    d.data[p]   = Math.floor(256*Math.random());
    d.data[p+1] = Math.floor(256*Math.random());
    d.data[p+2] = Math.floor(256*Math.random());
    d.data[p+3] = 255;
  }
  ctx.putImageData(d, 0, 0);
  return c;
}

var W = 16;
var H = 16;
var from = createRandomCanvas(W, H);
var to = createRandomCanvas(W, H);
var validator = new GlslTransitionValidator(from, to, W, H);

module.exports = validator;
