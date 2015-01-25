var Diaporama = require("diaporama");
var GlslTransitions = require("glsl-transitions");
var Qajax = require("qajax");

Qajax.getJSON("./diaporama.json").then(function (json) {

  return new Diaporama({
    container: document.getElementById("diaporama"),
    GlslTransitions: GlslTransitions,
    data: json
  }).start();

}).done();
