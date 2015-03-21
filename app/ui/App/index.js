var React = require("react");
var _ = require("lodash");
var raf = require("raf");
var Combokeys = require("combokeys");

var PromiseMixin = require("../../mixins/PromiseMixin");
var Diaporama = require("../../models/Diaporama");
var MainPanel = require("../MainPanel");
var Viewer = require("../Viewer");
var Timeline = require("../Timeline");
var Bootstrap = require("../Bootstrap");
var DragLayer = require("../DragLayer");

var DEFAULT_PANEL = "library";

function getWidth () {
  return Math.max(800, window.innerWidth);
}
function getHeight () {
  return Math.max(500, window.innerHeight);
}

var App = React.createClass({

  mixins: [ PromiseMixin ],

  propTypes: {
    maxUndos: React.PropTypes.number,
    maxRedos: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      maxUndos: 80,
      maxRedos: 40
    };
  },

  getInitialState: function () {
    return {
      width: getWidth(),
      height: getHeight(),
      diaporama: undefined, // undefined means not loaded yet, null means no diaporama init yet
      diaporamaLocalized: null,
      history: [], // used for undo
      undoHistory: [], // used for redo
      panel: DEFAULT_PANEL,
      hoverTimeline: false,
      windowFocus: true,
      selectedItemPointer: null,
      time: 0,
      playing: false
    };
  },

  componentDidMount: function () {
    this.historizeDebounced = _.debounce(this.historize, 300);
    window.addEventListener("blur", this.onBlur);
    window.addEventListener("focus", this.onFocus);
    window.addEventListener("resize", this.onResize);
    this.sync(Diaporama.fetch()).done();
    this.startMainLoop();
    var ck = this.combokeys = new Combokeys(document);

    ck.bind('space', function (e) {
      e.preventDefault();
      if (this.state.playing) {
        this.onPause();
      }
      else {
        this.onPlay();
      }
    }.bind(this));

    ck.bind('command+z', function () {
      this.undo();
      return false;
    }.bind(this));

    ck.bind('command+shift+z', function () {
      this.redo();
      return false;
    }.bind(this));

    ck.bind(['backspace', 'del'], function () {
      this.alterSelection("removeItem");
      return false;
    }.bind(this));

    ck.bind(['left'], function () {
      this.onSelectionLeft();
      return false;
    }.bind(this));

    ck.bind(['command+left'], function () {
      this.alterSelection("moveItemLeft");
      return false;
    }.bind(this));

    ck.bind(['right'], function () {
      this.onSelectionRight();
      return false;
    }.bind(this));

    ck.bind(['command+right'], function () {
      this.alterSelection("moveItemRight");
      return false;
    }.bind(this));
  },

  componentWillUnmount: function () {
    window.removeEventListener("blur", this.onBlur);
    window.removeEventListener("focus", this.onFocus);
    window.removeEventListener("resize", this.onResize);
    this.combokeys.reset();
    this.stopMainLoop();
  },

  render: function () {
    var W = this.state.width;
    var H = this.state.height;
    var diaporama = this.state.diaporama;
    var diaporamaLocalized = this.state.diaporamaLocalized;
    var panel = this.state.panel;
    var selectedItemPointer = this.state.selectedItemPointer;
    var time = this.state.time;
    var hoverTimeline = this.state.hoverTimeline;

    if (diaporama === undefined) return <div>Loading...</div>;

    if (diaporama === null) return <Bootstrap onSubmit={this.bootstrap} />;

    // Bounds
    var viewerW, viewerH;
    if (H * 2 / 3 < W / 2) {
      viewerH = Math.round(H / 2);
      viewerW = Math.round(viewerH * 4 / 3);
    }
    else {
      viewerW = Math.round(W / 2);
      viewerH = Math.round(viewerW * 3 / 4);
    }
    viewerW = Math.max(W - 800, Math.min(300, viewerW));
    viewerH = Math.max(H - 300, viewerH);

    var viewerBound = {
      x: W-viewerW,
      y: 0,
      width: viewerW,
      height: viewerH
    };
    var mainPanelBound = {
      x: 0,
      y: 0,
      width: W-viewerW,
      height: viewerH
    };
    var timelineBound = {
      x: 0,
      y: viewerH,
      width: W,
      height: H-viewerH
    };

    return <div>

      <DragLayer />

      <MainPanel
        bound={mainPanelBound}
        panel={panel}
        selectedItemPointer={selectedItemPointer}
        diaporama={diaporama}
        alterSelection={this.alterSelection}
        alterDiaporama={this.alterDiaporama}
        onNav={this.onNav}
      />

      <Viewer
        time={time}
        bound={viewerBound}
        diaporama={diaporamaLocalized}
        onPause={this.onPause}
        onPlay={this.onPlay}
        playing={this.state.playing}
      />

      <Timeline
        ref="timeline"
        time={time}
        hover={hoverTimeline}
        bound={timelineBound}
        diaporama={diaporama}
        selectedItemPointer={selectedItemPointer}
        alterDiaporama={this.alterDiaporama}
        alterSelection={this.alterSelection}
        onSelect={this.timelineSelect}
        onHoverEnter={this.onTimelineHoverEnter}
        onHoverLeave={this.onTimelineHoverLeave}
        onHoverMove={this.onTimelineHover}
      />

    </div>;
  },

  // Global Events

  onFocus: function () {
    if (!this.state.windowFocus)
      this.setState({ windowFocus: true });
  },

  onBlur: function () {
    if (this.state.windowFocus)
      this.setState({ windowFocus: false });
  },

  onResize: function () {
    this.resize(getWidth(), getHeight());
  },

  // Internal States Methods

  sync: function (diaporamaPromise) {
    var self = this;
    return diaporamaPromise.then(function (diaporama) {
      self.setState({
        diaporama: diaporama,
        diaporamaLocalized: Diaporama.localize(diaporama),
        history: [],
        undoHistory: []
      });
      return diaporama;
    }, function skipErrors(){});
  },

  saveDiaporama: function (newDiaporama) {
    if (!newDiaporama) return;
    this.historizeDebounced(this.state.diaporama);
    this._save(newDiaporama);
  },

  _save: function (newDiaporama) {
    this.setState({
      diaporama: newDiaporama,
      diaporamaLocalized: Diaporama.localize(newDiaporama)
    });
    // TODO debounce it a bit
    // TODO better feedback on failure cases ?
    Diaporama.save(newDiaporama).done();
  },

  bootstrap: function (options) {
    this.sync(Diaporama.bootstrap(options))
      .then(this.saveDiaporama.bind(this));
  },

  resize: function (W, H) {
    this.setState({
      width: W,
      height: H
    });
  },

  redo: function () {
    if (this.state.undoHistory.length <= 0) return;
    var history = _.clone(this.state.history);
    var undoHistory = _.clone(this.state.undoHistory);
    var newDiaporama = undoHistory.pop();
    history.push(this.state.diaporama);
    if (history.length >= this.props.maxUndos) {
      history = _.rest(history);
    }
    this.setState({
      history: history,
      undoHistory: undoHistory
    });
    this._save(newDiaporama);
  },

  undo: function () {
    if (this.state.history.length <= 0) return;
    var history = _.clone(this.state.history);
    var undoHistory = _.clone(this.state.undoHistory);
    var newDiaporama = history.pop();
    undoHistory.push(this.state.diaporama);
    if (undoHistory.length >= this.props.maxRedos) {
      undoHistory = _.rest(undoHistory);
    }
    this.setState({
      history: history,
      undoHistory: undoHistory
    });
    this._save(newDiaporama);
  },

  historize: function (diaporama) {
    var history = _.clone(this.state.history);
    var undoHistory = [];
    history.push(diaporama);
    if (history.length >= this.props.maxUndos) {
      history = _.rest(history);
    }
    this.setState({
      history: history,
      undoHistory: undoHistory
    });
  },

  timelineSelect: function (selection, preservePanel) {
    this.setState({
      panel: selection ?
        (preservePanel ? this.state.panel : (selection.transition ? "editTransition" : "editImage")) :
        (this.state.panel === "editTransition" || this.state.panel === "editImage" ? DEFAULT_PANEL : this.state.panel),
      selectedItemPointer: selection
    });
  },

  alterDiaporama: function (action, arg1, arg2) {
    var newDiaporama = Diaporama.alterDiaporama(this.state.diaporama, action, arg1, arg2);
    if (newDiaporama) {
      this.saveDiaporama(newDiaporama);
    }
  },

  alterSelection: function (action, arg1) {
    var selectedItemPointer = this.state.selectedItemPointer;
    if (!selectedItemPointer) return;
    if (action === "removeItem") this.timelineSelect(null);
    this.alterDiaporama(action, selectedItemPointer, arg1);
  },


  stopMainLoop: function () {
    this._stop = true;
  },

  startMainLoop: function () {
    var self = this;
    var last;
    var p = 0;
    // Main update loop like we can find it in games ;-)
    (function loop (t) {
      if (self._stop) return;
      raf(loop);
      if (!last) last = t;
      var dt = t - last;
      last = t;

      // We do nothing when window is not focus (e.g; in tab)
      if (!self.state.windowFocus) return;

      var panel = self.state.panel;
      var selectedItemPointer = self.state.selectedItemPointer;
      var diaporama = self.state.diaporama;
      var hoverTimeline = self.state.hoverTimeline;

      if (self.refs.timeline)
        self.refs.timeline.update(t, dt);

      // Animate time when not hover and one of the edit panels
      if (!hoverTimeline && self.state.playing) {
        var time, interval, duration;
        if (panel === "editTransition") {
          interval = Diaporama.timelineTimeIntervalForItemPointer(diaporama, selectedItemPointer);
          if (interval) {
            duration = interval.end - interval.start;
            p = (p + dt / duration) % 1;
            time = interval.start + duration * p;
            self.setState({
              time: time
            });
          }
        }
        else if (panel === "editImage") {
          interval = Diaporama.timelineTimeIntervalForItemPointer(diaporama, selectedItemPointer);
          if (interval) {
            duration = interval.end - interval.start;
            p = ((duration * p + dt) / duration) % 1;
            time = interval.start + duration * p;
            self.setState({
              time: time
            });
          }
        }
        else {
          self.setState({
            time: (self.state.time+dt) % Diaporama.duration(diaporama)
          });
        }
      }
    }());
  },

  onSelectionLeft: function () {
    var selectedItemPointer = this.state.selectedItemPointer;
    if (selectedItemPointer) {
      var index = Diaporama.timelineIndexOfId(this.state.diaporama, selectedItemPointer.id) - 1;
      var item = this.state.diaporama.timeline[index];
      if (item) {
        this.timelineSelect(_.defaults({ id: item.id }, selectedItemPointer||{}));
      }
    }
  },

  onSelectionRight: function () {
    var selectedItemPointer = this.state.selectedItemPointer;
    var index = !selectedItemPointer ? 0 : Diaporama.timelineIndexOfId(this.state.diaporama, selectedItemPointer.id) + 1;
    var item = this.state.diaporama.timeline[index];
    if (item) {
      this.timelineSelect(_.defaults({ id: item.id }, selectedItemPointer||{}));
    }
  },

  onTimelineHoverEnter: function () {
    this.setState({
      hoverTimeline: true
    });
  },

  onTimelineHoverLeave: function () {
    this.setState({
      hoverTimeline: false
    });
  },

  onTimelineHover: function (time) {
    if (this.state.time !== time) {
      this.setState({
        time: time
      });
    }
  },

  onNav: function (panel) {
    this.setState({
      panel: panel
    });
  },

  onPause: function () {
    this.setState({
      playing: false
    });
  },

  onPlay: function () {
    this.setState({
      playing: true
    });
  }

});

module.exports = App;
