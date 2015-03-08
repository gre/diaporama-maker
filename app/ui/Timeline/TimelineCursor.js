var React = require("react");

var TimelineCursor = React.createClass({

  render: function () {
    var time = this.props.time;
    var timeScale = this.props.timeScale;
    var x = time * timeScale;
    var style = {
      position: "absolute",
      zIndex: 30,
      left: Math.round(x)+"px",
      top: 0,
      width: "2px",
      height: "100%",
      background: "rgba(0,0,0,0.3)"
    };
    var headerStyle = {
      position: "absolute",
      left: 0,
      top: 0,
      width: "2px",
      height: "16px",
      background: "#fc0"
    };
    return <div style={style}>
      <div style={headerStyle} />
    </div>;
  }
});

module.exports = TimelineCursor;
