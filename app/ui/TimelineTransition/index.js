var React = require("react");
var translateStyle = require("../../core/translateStyle");

var TimelineTransition = React.createClass({

  render: function () {
    var xcenter = this.props.xcenter;
    var width = this.props.width;
    var height = this.props.height;
    var transition = this.props.transition;

    var x = xcenter - width/2;

    return <div className="transition" style={translateStyle(x, 0)}>
      <div style={{ width: width+"px", height: height+"px" }}>
        <span className="name">
          {transition.name || "fade"}
        </span>
      </div>
    </div>;
  }
});


module.exports = TimelineTransition;
