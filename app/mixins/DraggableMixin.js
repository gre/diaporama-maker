
var DRAG_DIST = require("../constants").MIN_DRAG_THRESHOLD;

/**
 * A mixin to help when watching mouse events for a drag to start.
 * When the drag is detected, onDragStart is called.
 * Default behavior of onDragStart is to deletate to parent function.
 */

var DraggableMixin = {

  // Lifecycle methods

  getInitialState: function () {
    return {
      mouseDown: null
    };
  },
  
  // Overridable methods / constants

  DRAG_DIST_2: DRAG_DIST * DRAG_DIST,

  getEventStats: function (e) {
    return {
      at: [ e.clientX, e.clientY ],
      time: Date.now()
    };
  },

  onDragStartEnhanceEvent: function (e) {
    var node = this.getDOMNode();
    var rect = node.getBoundingClientRect();
    e.grab = [
      e.at[0] - rect.left,
      e.at[1] - rect.top
    ];
    return e;
  },

  onDragStart: function (e) {
    if (this.props.onDragStart)
      this.props.onDragStart(e);
  },

  // Public methods

  draggableProps: function () {
    // TODO: we could dynamically change the events to save some call & if()
    // (don't bind on move if not needed)
    var props = {
      onMouseDown: this._Draggable_onMouseDown,
      onMouseUp: this._Draggable_onMouseUp,
      onMouseMove: this._Draggable_onMouseMove,
      onMouseLeave: this._Draggable_onMouseLeave
    };
    return props;
  },

  // Private methods

  _Draggable_onMouseDown: function (e) {
    e.preventDefault();
    var mouseDown = this.getEventStats(e);
    this.setState({
      mouseDown: mouseDown
    });
  },

  _Draggable_onMouseMove: function (e) {
    var mouseDown = this.state.mouseDown;
    if (!mouseDown) return;
    e.preventDefault();
    var mouseMove = this.getEventStats(e);
    var delta = [ mouseMove.at[0] - mouseDown.at[0], mouseMove.at[1] - mouseDown.at[1] ];
    var dist2 = delta[0] * delta[0] + delta[1] * delta[1];
    if (dist2 > this.DRAG_DIST_2) {
      this.onDragStart(this.onDragStartEnhanceEvent(mouseMove));
      this.setState({
        mouseDown: null
      });
    }
  },

  _Draggable_onMouseUp: function () {
    this.setState({
      mouseDown: null
    });
  },

  _Draggable_onMouseLeave: function (e) {
    var mouseDown = this.state.mouseDown;
    if (mouseDown) {
      var mouseLeave = this.getEventStats(e);
      this.onDragStart(mouseLeave);
      this.setState({
        mouseDown: null
      });
    }
  },

};

module.exports = DraggableMixin;
