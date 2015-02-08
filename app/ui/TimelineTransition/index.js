var React = require("react");
var _ = require("lodash");
var UniformsEditor = require("glsl.io-client/src/ui/UniformsEditor");
var translateStyle = require("../../core/translateStyle");
var transitions = require("../../models/transitions");
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

    var transitionObject = transitions.byName(transition.name);

    var x = xcenter - width/2;

    return <div className="timeline-transition" style={translateStyle(x, 0)}>
      <div style={{ width: width+"px", height: height+"px" }}>
        <span className="name">
          {transition.name || "fade"}
        </span>
        <div className="sub-actions">
          <Icon name="line-chart" color="#fff" onClick={this.props.onEasing} />
        </div>
        <div>
          <input type="number" min={100} step={100} max={3000} value={transition.duration} onChange={this.onDurationChange} />
        </div>
        <div>
        {!_.keys(transitionObject.types).length ? undefined :
          <UniformsEditor initialUniformValues={_.extend({}, transitionObject.uniforms, transition.uniforms)} uniforms={transitionObject.types} onUniformsChange={this.props.onUniformsChange} />
        }
        </div>
      </div>
    </div>;
  }
});


module.exports = TimelineTransition;
