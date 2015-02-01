
var _ = require("lodash");
var Qajax = require("qajax");

var toProjectUrl = require("../core/toProjectUrl");

var Diaporama = {};

var newId = (function (i) { return function () { return ++i; }; }(0));

function arraymove(arr, fromIndex, toIndex) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

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
  .then(Qajax.filterSuccess)
  .then(Qajax.toJSON)
  .then(function (json) {
    if (json.timeline) {
      for (var i = 0; i < json.timeline.length; ++i) {
        json.timeline[i].id = newId();
      }
    }
    return json;
  });
};

Diaporama.timelineAction = function (diaporama, action, id) {
  var index = _.findIndex(diaporama.timeline, function (item) { return item.id === id; });
  if (index === -1) return;
  if (action === "remove") {
    var clone = _.cloneDeep(diaporama);
    clone.timeline.splice(index, 1);
    return clone;
  }
  if (action === "moveLeft") {
    if (index === 0) return;
    var clone = _.cloneDeep(diaporama);
    arraymove(clone.timeline, index, index - 1);
    return clone;
  }
  if (action === "moveRight") {
    if (index === diaporama.timeline.length-1) return;
    var clone = _.cloneDeep(diaporama);
    arraymove(clone.timeline, index, index + 1);
    return clone;
  }
  console.log("unknown action "+action);
};

Diaporama.timelineAdd = function (diaporama, file) {
  var clone = _.cloneDeep(diaporama);
  clone.timeline.push({
    id: newId(),
    image: file,
    duration: 2000,
    transitionNext: { duration: 1000 }
  });
  return clone;
};

Diaporama.localize = function (diaporama) {
  var clone = _.cloneDeep(diaporama);
  clone.timeline.forEach(function (item) {
    item.image = toProjectUrl(item.image);
  });
  return clone;
};

module.exports = Diaporama;
