
var DiaporamaRecorder = require("diaporama-recorder");
var _ = require("lodash");
var Q = require("q");
var Qajax = require("qajax");
var transitions = require("./transitions");

var toProjectUrl = require("../core/toProjectUrl");
var network = require("../core/network");
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

Diaporama.generateVideo = function (diaporama, options) {

  var recorder = DiaporamaRecorder(Diaporama.localize(diaporama), options);
  var d = Q.defer();
  var i = 0;

  var tl = diaporama.timeline;
  var duration = 0;
  var lastTransitionDuration = 0;
  for (var i=0; i < tl.length; ++i) {
    var el = tl[i];
    duration += el.duration + (lastTransitionDuration = el.transitionNext.duration);
  }
  duration -= lastTransitionDuration;

  network.emit("beginvideo", options);

  network.once("videoerror", function (msg) {
    recorder.abort(new Error(msg));
  });

  recorder
    .record()
    .subscribe(function (data) {
      network.emit("videoframe", data);
      d.notify(i++ / recorder.nbFrames);
    }, function (error) {
      network.emit("endvideo", { message: error.message });
      d.reject(error);
    }, function () {
      network.emit("endvideo", null);
      d.resolve();
    });
  return d.promise;
};

Diaporama.generateHTML = function () {
  return Qajax({
    method: "POST",
    url: "/diaporama/generate/html"
  })
  .then(Qajax.filterSuccess);
};

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
  var copy = Diaporama.inlineTransitions(_.cloneDeep(diaporama));
  if (copy.timeline) {
    for (var i = 0; i < copy.timeline.length; ++i) {
      delete copy.timeline[i].id;
    }
  }
  // TODO: replace with using network
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

// TODO: these should be made more efficient

Diaporama.timelineIndexOfId = function (diaporama, id) {
  var tl = diaporama.timeline;
  for (var i=0; i < tl.length; ++i) {
    if (tl[i].id === id)
      return i;
  }
  return -1;
};

Diaporama.timelineTimeIntervalForTransitionId = function (diaporama, id) {
  var tl = diaporama.timeline;
  var t = 0;
  for (var i=0; i < tl.length; ++i) {
    var el = tl[i];
    t += el.duration;
    if (el.id === id) {
      return {
        start: t,
        end: t + el.transitionNext.duration
      };
    }
    t += el.transitionNext.duration;
  }
};
Diaporama.timelineTimeIntervalForId = function (diaporama, id) {
  var tl = diaporama.timeline;
  var t = 0;
  for (var i=0; i < tl.length; ++i) {
    var el = tl[i];
    if (el.id === id) {
      return {
        start: t,
        end: t + el.duration
      };
    }
    t += el.duration + el.transitionNext.duration;
  }
};

Diaporama.timelineForId = function (diaporama, id) {
  return diaporama.timeline[Diaporama.timelineIndexOfId(diaporama, id)];
};

Diaporama.timelineTransitionForId = function (diaporama, id) {
  var i = Diaporama.timelineIndexOfId(diaporama, id);
  var from = diaporama.timeline[i];
  var to = diaporama.timeline[i+1 >= diaporama.timeline.length ? 0 : i+1];
  return {
    from: from,
    transitionNext: from.transitionNext,
    to: to
  };
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

Diaporama.inlineTransitions = function (diaporama) {
  var copy = _.clone(diaporama);
  var keys = {};
  for (var i = 0; i < copy.timeline.length; ++i) {
    var obj = copy.timeline[i];
    if (obj.transitionNext && obj.transitionNext.name) {
      keys[obj.transitionNext.name] = 1;
    }
  }
  copy.transitions = _.map(_.keys(keys), function (name) {
    return _.pick(transitions.byName(name), [ "glsl", "uniforms", "name" ]);
  });
  return copy;
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
