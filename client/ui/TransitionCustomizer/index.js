var React = require("react");
var _ = require("lodash");
var BezierEasing = require("bezier-easing");
var DurationInput = require("../DurationInput");
var transitions = require("../../models/transitions");
var TransitionPicker = require("../TransitionPicker");
var BezierEditorAndPicker = require("../BezierEditorAndPicker");
var UniformsEditor = require("glsl-uniforms-editor");
var Icon = require("../Icon");

var TransitionCustomizer = React.createClass({

  propTypes: {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func,
    width: React.PropTypes.number,
    images: React.PropTypes.arrayOf(React.PropTypes.string),
    progress: React.PropTypes.number,
    openTransitionPicker: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      width: 300,
      progress: 0
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

  onRemove: function (e) {
    e.preventDefault();
    this.props.onRemove();
  },

  render: function () {
    const {
      value,
      width,
      onRemove,
      images,
      progress,
      openTransitionPicker
    } = this.props;

    var transition = transitions.byName(value.name);
    var interPadding = 10;
    var w1 = Math.floor(width * 0.5);
    var w2 = width - w1;
    var h = Math.min(200, w2);

    var uniforms = _.extend({}, transition.uniforms, value.uniforms);

    var deleteIconStyle = {
      position: "absolute",
      top: "2px",
      right: "6px",
      color: "#F00"
    };


    return <div>
      {onRemove ?
      <a href="#" onClick={this.onRemove} style={deleteIconStyle}>
        Remove&nbsp;<Icon name="remove"/>
      </a>
      : undefined}

      <DurationInput
        value={value.duration}
        onChange={this.onDurationChange}
        width={width}
        title="Transition Duration:"
      />
      <div style={{ display: "inline-block", marginRight: interPadding+"px" }}>
        <TransitionPicker
          value={transition}
          onChange={this.onTransitionChange}
          width={w1-interPadding}
          height={h}
          overlayBounds={[ 0, 0, width, Math.max(h, width*0.6) ]}
          transitionUniforms={uniforms}
          transitionDuration={value.duration}
          transitionEasing={value.easing ? BezierEasing.apply(null, value.easing) : BezierEasing.css.linear}
          images={images}
          openTransitionPicker={openTransitionPicker}
        />
      </div>
      <div style={{ display: "inline-block" }}>
        <BezierEditorAndPicker
          value={value.easing}
          onChange={this.onEasingChange}
          width={w2-10}
          height={h}
          progress={progress}
        />
      </div>

      {!_.keys(transition.types).length ? undefined :
      <UniformsEditor
        style={{ margin: "0 auto" }}
        values={uniforms}
        types={transition.types}
        onChange={this.onUniformsChange}
      />
      }
    </div>;
  }

});

module.exports = TransitionCustomizer;
