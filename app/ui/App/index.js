var React = require("react");
var _ = require("lodash");
var raf = require("raf");
var isUndo = require('is-undo-redo').undo;
var isRedo = require('is-undo-redo').redo;
var DragLayerMixin = require("react-dnd").DragLayerMixin;

var PromiseMixin = require("../../mixins/PromiseMixin");
var Diaporama = require("../../models/Diaporama");
var MainPanel = require("../MainPanel");
var Viewer = require("../Viewer");
var Timeline = require("../Timeline");
var Bootstrap = require("../Bootstrap");
var DragItems = require("../../constants").DragItems;
var translateStyle = require("../../core/translateStyle");
var toProjectUrl = require("../../core/toProjectUrl");
var LibraryImage = require("../LibraryImage");

var DEFAULT_PANEL = "library";

function getWidth () {
  return Math.max(800, window.innerWidth);
}
function getHeight () {
  return Math.max(500, window.innerHeight);
}

var DragLayer = React.createClass({
  mixins: [ DragLayerMixin ],

  render: function () {
    var state = this.getDragLayerState();

    if (state.isDragging) {
      var style = {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: "none"
      };

      switch (state.draggedItemType) {
        case DragItems.SLIDE:
          _.extend(style, translateStyle(
            state.currentOffsetFromClient.x - 100,
            state.currentOffsetFromClient.y - 75
          ));
          // Hack: for now use LibraryImage
          return <LibraryImage
            style={style}
            width={200}
            height={150}
            item={{ url: toProjectUrl(state.draggedItem.image), file: state.draggedItem.image }}
            dragging={true}
          />;

        case DragItems.IMAGE:
          _.extend(style, translateStyle(state.currentOffset.x, state.currentOffset.y));
          return <LibraryImage
            style={style}
            width={120}
            height={80}
            item={state.draggedItem}
            dragging={true} />;
      }
    }
    return <div />;
  }
});

var App = React.createClass({

  mixins: [ PromiseMixin ],

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
      time: 0
    };
  },

  componentDidMount: function () {
    this.historizeDebounced = _.debounce(this.historize, 300);
    window.addEventListener("blur", this.onBlur);
    window.addEventListener("focus", this.onFocus);
    window.addEventListener("resize", this.onResize);
    document.body.addEventListener("keydown", this.onKeyDown);
    document.body.addEventListener("keyup", this.onKeyUp);
    this.sync(Diaporama.fetch()).done();
    this.startMainLoop();
  },

  componentWillUnmount: function () {
    window.removeEventListener("blur", this.onBlur);
    window.removeEventListener("focus", this.onFocus);
    window.removeEventListener("resize", this.onResize);
    document.body.removeEventListener("keydown", this.onKeyDown);
    document.body.removeEventListener("keyup", this.onKeyUp);
    this.stopMainLoop();
  },

  onKeyDown: function (e) {
    if (isUndo(e)) {
      e.preventDefault();
      this.undo();
    }
    else if (isRedo(e)) {
      e.preventDefault();
      this.redo();
    }
    else switch (e.which) {
      case 13: // ENTER
        break;
      case 46: // DELETE
      case 8: // BACKSPACE
        e.preventDefault();
        this.onSelectionRemove();
        break;
      case 37: // LEFT
        e.preventDefault();
        if (e.metaKey || e.ctrlKey)
          this.onSelectionMoveLeft();
        else
          this.onSelectionLeft();
        break;
      case 39: // RIGHT
        e.preventDefault();
        if (e.metaKey || e.ctrlKey)
          this.onSelectionMoveRight();
        else
          this.onSelectionRight();
        break;
    }
  },

  onKeyUp: function () {
  },

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

  getEventStats: function (e) {
    return {
      at: [ e.clientX, e.clientY ],
      time: Date.now()
    };
  },

  onSlideSwap: function (a, b) {
    this.saveDiaporama(
      Diaporama.timelineSwapItem(this.state.diaporama, a, b)
    );
  },

  onImageDrop: function (img, place) {
    this.saveDiaporama(
      Diaporama.bootstrapImage(this.state.diaporama, img, place).diaporama
    );
  },

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

  resize: function (W, H) {
    this.setState({
      width: W,
      height: H
    });
  },

  bootstrap: function (options) {
    this.sync(Diaporama.bootstrap(options))
      .then(this.saveDiaporama.bind(this));
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

  saveDiaporama: function (newDiaporama) {
    if (!newDiaporama) return;
    this.historizeDebounced(this.state.diaporama);
    this._save(newDiaporama);
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

  onSelectionMoveLeft: function () {
    var selectedItemPointer = this.state.selectedItemPointer;
    if (selectedItemPointer) {
      this.saveDiaporama( Diaporama.timelineMoveItemLeft(this.state.diaporama, selectedItemPointer) );
    }
  },
  onSelectionMoveRight: function () {
    var selectedItemPointer = this.state.selectedItemPointer;
    if (selectedItemPointer) {
      this.saveDiaporama( Diaporama.timelineMoveItemRight(this.state.diaporama, selectedItemPointer) );
    }
  },

  alterDiaporama: function (action, arg1, arg2) {
    var newDiaporama = Diaporama.alterDiaporama(this.state.diaporama, action, arg1, arg2);
    if (newDiaporama) {
      this.saveDiaporama(newDiaporama);
    }
  },

  onSlideDropped: function (item) {
    this.saveDiaporama( Diaporama.timelineRemoveItem(this.state.diaporama, item) );
  },

  onSelectionRemove: function () {
    var selectedItemPointer = this.state.selectedItemPointer;
    if (selectedItemPointer) {
      this.timelineSelect(null);
      this.saveDiaporama( Diaporama.timelineRemoveItem(this.state.diaporama, selectedItemPointer) );
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

  onNav: function (panel) {
    this.setState({
      panel: panel
    });
  },

  onAddTransition: function (id) {
    this.saveDiaporama( Diaporama.bootstrapTransition(this.state.diaporama, id) );
    this.setState({
      panel: "editTransition",
      selectedItemPointer: { id: id, transition: true }
    });
  },

  onRemoveTransition: function (id) {
    this.saveDiaporama( Diaporama.removeTransition(this.state.diaporama, id) );
  },

  timelineSelect: function (selection, preservePanel) {
    this.setState({
      panel: selection ?
        (preservePanel ? this.state.panel : (selection.transition ? "editTransition" : "editImage")) :
        (this.state.panel === "editTransition" || this.state.panel === "editImage" ? DEFAULT_PANEL : this.state.panel),
      selectedItemPointer: selection
    });
  },

  onTimelineHover: function (time) {
    if (this.state.time !== time) {
      this.setState({
        time: time
      });
    }
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
      if (!hoverTimeline) {
        var time, interval, duration;
        if (panel === "editTransition") {
          interval = Diaporama.timelineTimeIntervalForTransitionId(diaporama, selectedItemPointer.id);
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
          interval = Diaporama.timelineTimeIntervalForId(diaporama, selectedItemPointer.id);
          if (interval) {
            duration = interval.end - interval.start;
            p = ((duration * p + dt) / duration) % 1;
            time = interval.start + duration * p;
            self.setState({
              time: time
            });
          }
        }
      }
    }());
  },

  onSelectedImageEdit: function (element) {
    var id = this.state.selectedItemPointer.id;
    this.saveDiaporama(
      Diaporama.setTimelineElement(this.state.diaporama, id, element)
    );
  },

  onSelectedTransitionEdit: function (transitionNext) {
    var id = this.state.selectedItemPointer.id;
    this.saveDiaporama(
      Diaporama.setTransition(this.state.diaporama, id, transitionNext)
    );
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
        onNav={this.onNav}
        onSelectedImageEdit={this.onSelectedImageEdit}
        onSelectedTransitionEdit={this.onSelectedTransitionEdit}
        onSelectionRemove={this.onSelectionRemove}
        onSlideDropped={this.onSlideDropped}
      />

      <Viewer
        time={time}
        bound={viewerBound}
        diaporama={diaporamaLocalized} />

      <Timeline
        ref="timeline"
        time={time}
        onHoverEnter={this.onTimelineHoverEnter}
        onHoverLeave={this.onTimelineHoverLeave}
        onHoverMove={this.onTimelineHover}
        hover={hoverTimeline}
        bound={timelineBound}
        diaporama={diaporama}
        selectedItemPointer={selectedItemPointer}
        onSelect={this.timelineSelect}
        onSelectionRemove={this.onSelectionRemove}
        onSelectionMoveLeft={this.onSelectionMoveLeft}
        onSelectionMoveRight={this.onSelectionMoveRight}
        onAddTransition={this.onAddTransition}
        onImageDrop={this.onImageDrop}
        onSlideSwap={this.onSlideSwap}

        alterDiaporama={this.alterDiaporama}
      />

    </div>;
  }
});

module.exports = App;
