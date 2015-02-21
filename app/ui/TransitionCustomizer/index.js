var React = require("react");
var _ = require("lodash");
var BezierEasing = require("bezier-easing");
var DurationInput = require("../DurationInput");
var transitions = require("../../models/transitions");
var TransitionPicker = require("../TransitionPicker");
var BezierEditor = require("glsl.io-client/src/ui/BezierEditor");
var UniformsEditor = require("glsl.io-client/src/ui/UniformsEditor");

function printEasing (easing) {
  return "BezierEasing("+easing.map(function (value) { return Math.round(value * 100) / 100; })+")";
}

var TransitionCustomizer = React.createClass({

  propTypes: {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func,
    width: React.PropTypes.number,
    maxBezierEditorSize: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      width: 300,
      maxBezierEditorSize: 200
    };
  },

  onDurationChange: function (duration) {
    this.props.onChange(_.defaults({ duration: duration }, this.props.value));
  },

  onEasingChange: function (easing) {
    this.props.onChange(_.defaults({ easing: easing }, this.props.value));
  },

  onTransitionChange: function (tname) {
    this.props.onChange(_.defaults({ name: tname }, this.props.value));
  },

  onUniformsChange: function (uniforms) {
    this.props.onChange(_.defaults({ uniforms: uniforms }, this.props.value));
  },

  render: function () {
    var value = this.props.value;
    var transition = transitions.byName(value.name);
    var width = this.props.width;
    var w = width / 2;
    var h = Math.round(w * 0.6);
    var bezierEditorSize = Math.min(this.props.maxBezierEditorSize, w);
    var paddingW = (w-bezierEditorSize) / 2;

    var uniforms = _.extend({}, transition.uniforms, value.uniforms);

    var previewStyle = {
      fontFamily: "monospace",
      textAlign: "center",
      margin: "4px"
    };

    return <div className="transition-customizer">
      <div style={previewStyle}>
        {(value.name || "fade")+" "+(value.duration/1000)+"s "+(value.easing && printEasing(value.easing) || "linear")}
      </div>
      <div style={{ display: "inline-block" }}>
        <TransitionPicker
          value={transition}
          onChange={this.onTransitionChange}
          width={w}
          height={h}
          overlayBounds={[ 0, 0, width, Math.max(h, width*0.6) ]}
          transitionUniforms={uniforms}
          transitionDuration={value.duration}
          transitionEasing={value.easing ? BezierEasing.apply(null, value.easing) : BezierEasing.css.linear}
        />
      </div>
      <div style={{ display: "inline-block" }}>
        <BezierEditor
          value={value.easing}
          onChange={this.onEasingChange}
          width={w}
          height={h}
          handleRadius={10}
          padding={[10, paddingW, 20, paddingW]}
        />
      </div>
      <DurationInput
        value={value.duration}
        onChange={this.onDurationChange}
        width={width}
        title="Transition Duration:"
      />

      {!_.keys(transition.types).length ? undefined :
      <div style={{ position: "relative" }}>
        <strong style={{ position: "absolute", left: "0px", top: "10px" }}>Uniforms:</strong>
        <div style={{ marginLeft: (w)+"px" }}>
          <UniformsEditor
            initialUniformValues={uniforms}
            uniforms={transition.types}
            onUniformsChange={this.onUniformsChange}
          />
        </div>
      </div>
      }
    </div>;
  }

});

module.exports = TransitionCustomizer;
