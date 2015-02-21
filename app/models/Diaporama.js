
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
  .then(assignIds);
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

Diaporama.setTimelineElement = function (diaporama, id, element) {
  var clone = _.cloneDeep(diaporama);
  var index = Diaporama.timelineIndexOfId(clone, id);
  clone.timeline[index] = element;
  return clone;
};

Diaporama.setTransition = function (diaporama, id, transition) {
  var clone = _.cloneDeep(diaporama);
  var el = Diaporama.timelineForId(clone, id);
  el.transitionNext = transition;
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
