var GlslTransitions = require("glsl-transitions");
var _ = require("lodash");
var GlslTransitionFade = require("glsl-transition-fade");

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
collection.push(_.extend({ types: {} }, GlslTransitionFade));

var byName = _.groupBy(collection, "name");

module.exports = {
  collection: collection,
  collectionForDiaporama: function (diaporama) {
    const countsByName = {};
    diaporama.timeline.forEach(t => {
      var name = t.transitionNext && t.transitionNext.name;
      if (name) countsByName[name] = (countsByName[name]||0) + 1;
    });

    const divergedCollection =
    (diaporama.transitions||[])
    .filter(t => {
      var existing = byName[t.name][0];
      return (
        !existing ||
        existing.glsl !== t.glsl ||
        !_.isEqual(existing.uniforms, t.uniforms)
      );
    })
    .map(t => _.extend({
      diverged: true,
      // Fallback some required fields in case they are not provided
      id: ""+Math.random(),
      name: "(no name)",
      owner: "(no owner)",
      stars: 0
    }, t));

    const collectionForDiaporama =
    (collection.map(t => _.extend({ diverged: false }, t)).concat(divergedCollection))
    .map(t => _.extend({ usedCount: countsByName[t.name]||0 }, t))
    .sort((a, b) =>
       100 * ((!!b.diverged) - (!!a.diverged)) +
         1 * (b.usedCount - a.usedCount) +
      0.01 * (b.stars - a.stars));

    return collectionForDiaporama;
  },
  byName: function (name) {
    var o = byName[name];
    return o && o[0] || GlslTransitionFade;
  }
};
