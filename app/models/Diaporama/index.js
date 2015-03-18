
var _ = require("lodash");
var Q = require("q");
var Qajax = require("qajax");
var transitions = require("../transitions");

var toProjectUrl = require("../../core/toProjectUrl");
var network = require("../../core/network");
var genTimelineElementDefault = require("../../../common/genTimelineElementDefault");

var recorderClient = require("diaporama-recorder/client")(network);

var Diaporama = {};

var newId = (function (i) { return function () { return ++i; }; }(0));

// Mutating private utilities

function assignIds (json) {
  if (json.timeline) {
    for (var i = 0; i < json.timeline.length; ++i) {
      json.timeline[i].id = newId();
    }
  }
  return json;
}

function swapTimelineSlideTransitions (clone, i, j) {
  var a = clone.timeline[i];
  var b = clone.timeline[j];
  var tmp = b.transitionNext;
  if (a.transitionNext) {
    b.transitionNext = a.transitionNext;
  }
  else {
    delete b.transitionNext;
  }
  if (tmp) {
    a.transitionNext = tmp;
  }
  else {
    delete a.transitionNext;
  }
  return clone;
}

function swapTimelineSlide (clone, i, j) {
  var tmp = clone.timeline[i];
  clone.timeline[i] = clone.timeline[j];
  clone.timeline[j] = tmp;
  return clone;
}

// Diaporama network actions

var formatsD = Q.defer();
recorderClient.getFormats().subscribe(formatsD.resolve, formatsD.reject);
Diaporama.getFormats = function () {
  return formatsD.promise;
};

Diaporama.generateVideo = function (diaporama, options) {
  recorderClient.generateVideo(Diaporama.localize(diaporama, true), options);
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
  // TODO: replace with using network
  return Qajax({
    method: "POST",
    url: "/diaporama.json",
    data: Diaporama.inlineTransitions(Diaporama.clean(diaporama))
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

// Diaporama General Transformation Pass

Diaporama.clean = function (diaporama) {
  var copy = Diaporama.inlineTransitions(_.cloneDeep(diaporama));
  if (copy.timeline) {
    for (var i = 0; i < copy.timeline.length; ++i) {
      delete copy.timeline[i].id;
    }
  }
  return copy;
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

Diaporama.localize = function (diaporama, fullSize) {
  if (!diaporama) return null;
  var clone = _.cloneDeep(diaporama);
  clone.timeline.forEach(function (item) {
    item.image = toProjectUrl(item.image, fullSize);
  });
  return clone;
};


// Query methods

Diaporama.timelineIndexOfId = function (diaporama, id) {
  var tl = diaporama.timeline;
  for (var i=0; i < tl.length; ++i)
    if (tl[i].id === id)
      return i;
  return -1;
};

function timelineTimeIntervalForTransitionId (diaporama, id) {
  var tl = diaporama.timeline;
  var t = 0;
  for (var i=0; i < tl.length; ++i) {
    var el = tl[i];
    t += el.duration;
    var tnext = el.transitionNext;
    var tnextDuration = tnext && tnext.duration || 0;
    if (el.id === id) {
      return {
        start: t,
        end: t + tnextDuration
      };
    }
    t += tnextDuration;
  }
}

function timelineTimeIntervalForId (diaporama, id) {
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
    t += el.duration + (el.transitionNext && el.transitionNext.duration || 0);
  }
}

Diaporama.timelineTimeIntervalForItemPointer = function (diaporama, itemPointer) {
  // TODO: ^ this should be the only method
  if (itemPointer.transition) {
    return timelineTimeIntervalForTransitionId(diaporama, itemPointer.id);
  }
  else {
    return timelineTimeIntervalForId(diaporama, itemPointer.id);
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

Diaporama.lookupSegment = function (diaporama, time) {
  var tl = diaporama.timeline;
  var t = 0;
  for (var i=0; i < tl.length; ++i) {
    var item = tl[i];
    var duration = item.duration || 0;
    var tnext = item.transitionNext;
    var tnextDuration = tnext && tnext.duration || 0;

    if (t <= time && time <= t + duration) {
      return {
        id: item.id,
        transition: false
      };
    }

    t += duration;

    if (tnext) {
      if (t <= time && time <= t + tnextDuration) {
        return {
          id: item.id,
          transition: true
        };
      }
      t += tnextDuration;
    }
  }
  return null;
};

Diaporama.lookupBetweenImagePlace = function (diaporama, time) {
  var tl = diaporama.timeline;
  var t = 0;
  for (var i=0; i < tl.length; ++i) {
    var item = tl[i];
    var duration = item.duration || 0;
    var tnext = item.transitionNext;
    var tnextDuration = tnext && tnext.duration || 0;

    if (t <= time && time <= t + duration) {
      if (time <= t + duration/2) {
        return {
          id: item.id,
          before: true
        };
      }
      else {
        return {
          id: item.id,
          after: true
        };
      }
    }

    t += duration;

    if (tnext) {
      if (t <= time && time <= t + tnextDuration) {
        return {
          id: item.id,
          after: true
        };
      }
      t += tnextDuration;
    }
  }
  return null;
};

// Alterations

function roundDuration (d) {
  return Math.round(d/100) * 100;
}

var minTransitionDuration = 100;
var minSlideDuration = 100;

// TODO: refactor all Diaporama.* alteration calls to this
var actions = {
  resizeRight: function (diaporama, itemPointer, dt) {
    var i = Diaporama.timelineIndexOfId(diaporama, itemPointer.id);
    if (i === -1) return;
    var clone = _.cloneDeep(diaporama);
    var item = clone.timeline[i];
    if (itemPointer.transition) {
      var a = roundDuration(Math.max(minTransitionDuration, item.transitionNext.duration+dt));
      if (item.transitionNext.duration === a) return;
      item.transitionNext.duration = a;
    }
    else {
      var b = roundDuration(Math.max(minSlideDuration, item.duration+dt));
      if (item.duration === b) return;
      item.duration = b;
    }
    return clone;
  },

  resizeLeft: function (diaporama, itemPointer, dt) {
    var i = Diaporama.timelineIndexOfId(diaporama, itemPointer.id);
    if (i === -1) return;
    if (i === 0 && !itemPointer.transition) return;
    var clone = _.cloneDeep(diaporama);
    var item = clone.timeline[i];
    if (itemPointer.transition) {
      dt = Math.max(minSlideDuration, roundDuration(item.duration + dt)) - item.duration;
      dt = item.transitionNext.duration - Math.max(minTransitionDuration, roundDuration(item.transitionNext.duration - dt));
      var a = item.duration + dt;
      var b = item.transitionNext.duration - dt;
      if (item.duration === a && item.transitionNext.duration === b) return;
      item.duration = a;
      item.transitionNext.duration = b;
    }
    else {
      var prev = clone.timeline[i-1];
      var prevDur = prev.transitionNext ? prev.transitionNext.duration : prev.duration;
      dt = Math.max(minTransitionDuration, roundDuration(prevDur + dt)) - prevDur;
      dt = item.duration - Math.max(minSlideDuration, roundDuration(item.duration - dt));
      var c = prevDur + dt;
      var d = item.duration - dt;
      if (prevDur === c && item.duration === d) return;
      if (prev.transitionNext)
        prev.transitionNext.duration = c;
      else
        prev.duration = c;
      item.duration = d;
    }
    return clone;
  },

  setItem: function (diaporama, itemPointer, value) {
    var clone = _.cloneDeep(diaporama);
    var id = itemPointer.id;
    if (itemPointer.transition) {
      var el = Diaporama.timelineForId(clone, id);
      if (value.duration < minTransitionDuration) value.duration = minTransitionDuration;
      el.transitionNext = value;
    }
    else {
      var index = Diaporama.timelineIndexOfId(clone, id);
      if (value.duration < minSlideDuration) value.duration = minSlideDuration;
      clone.timeline[index] = value;
    }
    return clone;
  },

  bootstrapTransition: function (diaporama, id) {
                                                  // vvv  TODO not supported diaporama.maker.defaultTransition  vvv
    return actions.setItem(diaporama, { id: id, transition: true }, diaporama.maker && diaporama.maker.defaultTransition || {
      duration: 1000
    });
  },

  bootstrapImage: function (diaporama, src, place) {
    return actions.bootstrapImages(diaporama, [ src ], place);
  },

  bootstrapImages: function (diaporama, srcs, place) {
    var clone = _.cloneDeep(diaporama);
    // vvv  TODO not supported diaporama.maker.defaultImage  vvv
    var objs = srcs.map(function (src) {
      var obj = genTimelineElementDefault(src);
      obj.id = newId();
      return obj;
    });
    if (!place) {
      clone.timeline = clone.timeline.concat(objs);
    }
    else if (place.after) {
      var afterIndex = Diaporama.timelineIndexOfId(clone, place.id) + 1;
      Array.prototype.splice.apply(clone.timeline, [ afterIndex, 0 ].concat(objs));
    }
    else if (place.before) {
      var beforeIndex = Diaporama.timelineIndexOfId(clone, place.id);
      Array.prototype.splice.apply(clone.timeline, [ beforeIndex, 0 ].concat(objs));
    }
    return clone;
  },

  removeItem: function (diaporama, itemPointer) {
    var index = Diaporama.timelineIndexOfId(diaporama, itemPointer.id);
    if (index === -1) return;
    var clone = _.cloneDeep(diaporama);
    if (itemPointer.transition)
      delete clone.timeline[index].transitionNext;
    else
      clone.timeline.splice(index, 1);
    return clone;
  },

  moveItemLeft: function (diaporama, item) {
    var index = Diaporama.timelineIndexOfId(diaporama, item.id);
    if (index === 0) return;
    var clone = _.cloneDeep(diaporama);
    swapTimelineSlideTransitions(clone, index, index - 1);
    if (!item.transition) swapTimelineSlide(clone, index, index - 1);
    return clone;
  },

  moveItemRight: function (diaporama, item) {
    var index = Diaporama.timelineIndexOfId(diaporama, item.id);
    if (index === diaporama.timeline.length-1) return;
    var clone = _.cloneDeep(diaporama);
    swapTimelineSlideTransitions(clone, index, index + 1);
    if (!item.transition) swapTimelineSlide(clone, index, index + 1);
    return clone;
  },

  moveItem: function (diaporama, itemPointer, place) {
    if (!place) return;
    var clone = _.cloneDeep(diaporama);
    var indexFrom = Diaporama.timelineIndexOfId(diaporama, itemPointer.id);
    var indexTo = Diaporama.timelineIndexOfId(diaporama, place.id);
    if (indexFrom === -1 || indexTo === -1) return;
    if (indexTo === indexFrom) return;
    var item = clone.timeline[indexFrom];
    if (indexTo < indexFrom) indexTo ++;
    if (place.before) indexTo --;
    clone.timeline.splice(indexFrom, 1);
    clone.timeline.splice(indexTo, 0, item);
    return clone;
  }

};

Diaporama.alterDiaporama = function (diaporama, action, arg1, arg2) {
  var f = actions[action];
  if (!f) throw new Error("Action '"+action+"' not found.");
  return f(diaporama, arg1, arg2);
};


module.exports = Diaporama;
