
var _ = require("lodash");
var Qajax = require("qajax");

var toProjectUrl = require("../core/toProjectUrl");
var genTimelineElementDefault = require("../../common/genTimelineElementDefault");

var Diaporama = {};

var newId = (function (i) { return function () { return ++i; }; }(0));

function arraymove(arr, fromIndex, toIndex) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

function assignIds (json) {
  if (json.timeline) {
    for (var i = 0; i < json.timeline.length; ++i) {
      json.timeline[i].id = newId();
    }
  }
  return json;
}

Diaporama.bootstrap = function (options) {
  return Qajax({
    method: "POST",
    url: "/diaporama/bootstrap",
    data: options
  })
  .then(Qajax.filterSuccess)
  .then(Qajax.toJSON)
  .then(assignIds)
};

Diaporama.save = function (diaporama) {
  var copy = _.cloneDeep(diaporama);
  if (copy.timeline) {
    for (var i = 0; i < copy.timeline.length; ++i) {
      delete copy.timeline[i].id;
    }
  }
  return Qajax({
    method: "POST",
    url: "/diaporama.json",
    data: copy
  })
  .then(Qajax.filterSuccess)
  .then(Qajax.toJSON);
};

Diaporama.fetch = function () {
  return Qajax({
    method: "GET",
    url: "/diaporama.json"
  })
  .then(Qajax.filterStatus(200))
  .then(Qajax.toJSON)
  .then(assignIds)
  .fail(function (maybeXhr) {
    if (maybeXhr && maybeXhr.status === 204) {
      return null; // recover No Content
    }
    throw maybeXhr;
  });
};

Diaporama.timelineIndexOfId = function (diaporama, id) {
  // TODO: this should be made more efficient
  return _.findIndex(diaporama.timeline, function (item) { return item.id === id; });
};

Diaporama.timelineForId = function (diaporama, id) {
  return diaporama.timeline[Diaporama.timelineIndexOfId(diaporama, id)];
};

Diaporama.setKenBurns = function (diaporama, id, kenburns) {
  var clone = _.cloneDeep(diaporama);
  var el = Diaporama.timelineForId(clone, id);
  if (el) {
    el.kenburns = kenburns;
  }
  return clone;
};

Diaporama.setEasing = function (diaporama, id, forTransition, easing) {
  var clone = _.cloneDeep(diaporama);
  var el = Diaporama.timelineForId(clone, id);
  if (el) {
    if (forTransition) {
      if (!el.transitionNext) el.transitionNext = {};
      el.transitionNext.easing = easing;
    }
    else {
      if (!el.kenburns) el.kenburns = {};
      el.kenburns.easing = easing;
    }
  }
  return clone;
};

Diaporama.setTransition = function (diaporama, name) {
  var clone = _.cloneDeep(diaporama);
  for (var i=0; i<clone.timeline.length; ++i) {
    var el = clone.timeline[i];
    if (el.transitionNext && el.transitionNext.name !== name) {
      delete el.transitionNext.uniforms;
      el.transitionNext.name = name;
    }
  }
  return clone;
};

Diaporama.setTransitionDuration = function (diaporama, id, duration) {
  var clone = _.cloneDeep(diaporama);
  var el = Diaporama.timelineForId(clone, id);
  if (!el.transitionNext) el.transitionNext = {};
  el.transitionNext.duration = duration;
  return clone;
};

Diaporama.setTransitionUniforms = function (diaporama, id, uniforms) {
  var clone = _.cloneDeep(diaporama);
  var el = Diaporama.timelineForId(clone, id);
  if (!el.transitionNext) el.transitionNext = {};
  el.transitionNext.uniforms = uniforms;
  return clone;
};

Diaporama.setDuration = function (diaporama, id, duration) {
  var clone = _.cloneDeep(diaporama);
  var el = Diaporama.timelineForId(clone, id);
  el.duration = duration;
  return clone;
};

Diaporama.timelineAction = function (diaporama, action, id) {
  var clone, index = Diaporama.timelineIndexOfId(diaporama, id);
  if (index === -1) return;
  if (action === "remove") {
    clone = _.cloneDeep(diaporama);
    clone.timeline.splice(index, 1);
    return clone;
  }
  if (action === "moveLeft") {
    if (index === 0) return;
    clone = _.cloneDeep(diaporama);
    arraymove(clone.timeline, index, index - 1);
    return clone;
  }
  if (action === "moveRight") {
    if (index === diaporama.timeline.length-1) return;
    clone = _.cloneDeep(diaporama);
    arraymove(clone.timeline, index, index + 1);
    return clone;
  }
  console.log("unknown action "+action);
};

Diaporama.applySettings = function (diaporama, id, value) {
  var clone = _.cloneDeep(diaporama);
  switch (id) {
    case "loop":
      clone[id] = value;
      break;
  }
  return clone;
};

Diaporama.timelineAdd = function (diaporama, file) {
  var clone = _.cloneDeep(diaporama);
  var obj = genTimelineElementDefault(file);
  obj.id = newId();
  clone.timeline.push(obj);
  return clone;
};

Diaporama.localize = function (diaporama) {
  if (!diaporama) return null;
  var clone = _.cloneDeep(diaporama);
  clone.timeline.forEach(function (item) {
    item.image = toProjectUrl(item.image);
  });
  return clone;
};

module.exports = Diaporama;
