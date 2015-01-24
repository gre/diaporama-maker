var Diaporama = require("diaporama");
var GlslTransitions = require("glsl-transitions");
var Qajax = require("qajax");

Qajax.getJSON("./diaporama.json").then(function (json) {

  document.body.style.background = "#000";
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";

  var div = document.createElement("div");
  div.style.width = window.innerWidth + "px";
  div.style.height = window.innerHeight + "px";
  document.body.appendChild(div);

  var diaporama = new Diaporama({
    container: div,
    GlslTransitions: GlslTransitions,
    data: json
  });

  return diaporama.start();
}).done();
