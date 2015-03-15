var React = require("react");
var Icon = require("../Icon");

var TimelineSelectionResizeHandle = React.createClass({
  propTypes: {
    left: React.PropTypes.bool.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    timeScale: React.PropTypes.number.isRequired,
    onResize: React.PropTypes.func.isRequired,
    referenceValue: React.PropTypes.number.isRequired
  },
  getInitialState: function () {
    return {
      down: null
    };
  },
  onMouseDown: function (e) {
    this.setState({
      down: {
        clientX: e.clientX,
        referenceValue: this.props.referenceValue
      }
    });
  },
  onMouseMove: function (e) {
    var down = this.state.down;
    var dvalue = down.referenceValue - this.props.referenceValue;
    var dx = e.clientX - down.clientX;
    var dt = dx / this.props.timeScale;
    this.props.onResize(dvalue + dt);
  },
  onMouseUp: function () {
    this.setState({
      down: null
    });
  },
  onMouseLeave: function () {
    this.setState({
      down: null
    });
  },
  render: function () {
    var left = this.props.left;
    var width = this.props.width;
    var height = this.props.height;

    var padding = this.state.down ? 200 : 0;

    width += 2 * padding;

    var style = {
      zIndex: 51 + (this.state.down ? 1 : 0),
      position: "absolute",
      top: 0,
      width: width+"px",
      height: height+"px",
      padding: "0px "+padding+"px"
    };
    if (left) {
      style.left = - padding;
    }
    else {
      style.right = - padding;
    }

    var iconSize = 32;
    var iconStyle = {
      position: "absolute",
      top: Math.floor((height - iconSize) / 2)+"px",
      color: "#fc0"
    };
    if (left) {
      iconStyle.left = 2 + padding;
    }
    else {
      iconStyle.right = 2 + padding;
    }

    var eventBindings = {
      onMouseDown: this.onMouseDown
    };
    if (this.state.down) {
      eventBindings.onMouseMove = this.onMouseMove;
      eventBindings.onMouseUp = this.onMouseUp;
      eventBindings.onMouseLeave = this.onMouseLeave;
      // TODO: grow the handle width to avoid loosing the mouse
    }

    return <div
      style={style}
      {...eventBindings}
    >
      <Icon style={iconStyle} size={iconSize} name={left ? "angle-left" : "angle-right"} />
    </div>;
  },
});

module.exports = TimelineSelectionResizeHandle;
