var React = require("react");
var _ = require("lodash");
var Thumbnail = require("../Thumbnail");
var Icon = require("../Icon");

var DRAG_DIST = 10;

var LibraryImage = React.createClass({

  getDefaultProps: function () {
    return {
      used: 0
    };
  },

  getInitialState: function () {
    return {
      mouseDown: null
    };
  },

  getEventStats: function (e) {
    return {
      at: [ e.clientX, e.clientY ],
      time: Date.now()
    };
  },

  onMouseDown: function (e) {
    e.preventDefault();
    var mouseDown = this.getEventStats(e);
    this.setState({
      mouseDown: mouseDown
    });
  },

  onMouseMove: function (e) {
    var mouseDown = this.state.mouseDown;
    if (!mouseDown) return;
    e.preventDefault();
    var mouseMove = this.getEventStats(e);
    var delta = [ mouseMove.at[0] - mouseDown.at[0], mouseMove.at[1] - mouseDown.at[1] ];
    var dist2 = delta[0] * delta[0] + delta[1] * delta[1];
    if (dist2 > DRAG_DIST * DRAG_DIST) {
      this.onDragStart(mouseMove);
      this.setState({
        mouseDown: null
      });
    }
  },

  onMouseUp: function () {
    this.setState({
      mouseDown: null
    });
  },

  onMouseLeave: function (e) {
    var mouseDown = this.state.mouseDown;
    if (mouseDown) {
      var mouseLeave = this.getEventStats(e);
      this.onDragStart(mouseLeave);
      this.setState({
        mouseDown: null
      });
    }
  },

  onDragStart: function (e) {
    var node = this.getDOMNode();
    var rect = node.getBoundingClientRect();
    e.grab = [
      e.at[0] - rect.left,
      e.at[1] - rect.top
    ];
    if (this.props.onDragStart)
      this.props.onDragStart(e);
  },

  render: function () {
    var width = this.props.width;
    var height = this.props.height;
    var item = this.props.item;
    var used = this.props.used;
    var dragging = this.props.dragging;

    var style = _.extend({
      width: width+"px"
    }, this.props.style||{});
    
    var thumbnailStyle = {
      opacity: !used ? 1 : 0.5
    };

    var border = dragging ? 0 : 2;
    var thumbnailContainerStyle = {
      backgroundColor: "#000",
      border: border+"px solid",
      borderColor: used ? "#000" : "#FC0"
    };

    var countUsageStyle = {
      position: "absolute",
      bottom: "22px",
      right: "6px",
      color: "#fff",
      zIndex: 2,
      fontSize: "0.8em"
    };

    var titleStyle = {
      display: "inline-block",
      width: "100%",
      fontSize: "0.8em",
      fontWeight: 300,
      color: used ? "#666" : "#d80",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    };
    
    return <div
      className="library-image item"
      title={item.file}
      style={style}
      onMouseDown={this.onMouseDown}
      onMouseMove={this.onMouseMove}
      onMouseUp={this.onMouseUp}
      onMouseLeave={this.onMouseLeave}
    >
      { !used ? undefined :
        <span style={countUsageStyle}>
          {used}
          ×
        </span>}
      <div style={thumbnailContainerStyle}>
        <Thumbnail style={thumbnailStyle} width={width-2*border} height={height-2*border} image={item.url} />
      </div>
      {!this.props.onAddToTimeline ? undefined :
      <div className="actions">
        <Icon name="level-down" color="#fff" onClick={this.props.onAddToTimeline} />
      </div>
      }
      { dragging ? undefined :
      <span style={titleStyle}>{item.file}</span>
      }
    </div>;
  }

});

module.exports = LibraryImage;
