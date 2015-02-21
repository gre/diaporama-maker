var React = require("react");
var translateStyle = require("../../core/translateStyle");
var Icon = require("../Icon");

var TimelineTransition = React.createClass({

  onDurationChange: function (e) {
    this.props.onDurationChange(parseInt(e.target.value));
  },

  render: function () {
    var xcenter = this.props.xcenter;
    var width = this.props.width;
    var height = this.props.height;
    var transition = this.props.transition;

    var x = xcenter - width/2;

    return <div className="timeline-transition" style={translateStyle(x, 0)}>
      <div style={{ width: width+"px", height: height+"px" }}>
        <span className="name">
          {transition.name || "fade"}
        </span>
        <div className="sub-actions">
          <Icon name="pencil-square" color="#fff" size={50} onClick={this.props.onSelect} />
        </div>
      </div>
    </div>;
  }
});


module.exports = TimelineTransition;
