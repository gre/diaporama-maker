var GlslTransitions = require("glsl-transitions");
var _ = require("lodash");

var validator = require("../core/validator");

var ignoredUniforms = ["progress", "resolution", "from", "to"];
var unsupportedTypes = ["samplerCube"];
function keepCustomUniforms (uniforms) {
  return _.omit(uniforms, function (uniformType, uniformName) {
    return _.contains(ignoredUniforms, uniformName) || _.contains(unsupportedTypes, uniformType);
  });
}

function filterWithoutCustomSampler2D (transitions, mapFilter) {
  return transitions.filter(function (t) {
    for (var k in t.uniforms)
    if (typeof t.uniforms[k] === "string")
    return false;
  return true;
  }).map(mapFilter).filter(function (t) { return !!t; });
}

// Test and filter transitions
var collection = filterWithoutCustomSampler2D(GlslTransitions.sort(function (a, b) {
  return b.stars - a.stars;
}), function (t) {
  var validation = validator.forGlsl(t.glsl);
  var compiles = validation.compiles();
  var uniformTypes = compiles ? validation.uniforms() : {};
  validation.destroy();
  if (compiles) {
    return _.extend({ types: keepCustomUniforms(uniformTypes) }, t);
  }
  else {
     console.log("transition '"+ t.name +"' failed to compile.");
  }
});

var byName = _.groupBy(collection, "name");

module.exports = {
  collection: collection,
  byName: function (name) {
    var o = byName[name];
    return o && o[0];
  }
};
