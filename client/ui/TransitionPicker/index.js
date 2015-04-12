var React = require("react");
var Transitions = require("../Transitions");
var Vignette = require("glsl-transition-vignette");
var Icon = require("../Icon");
import VignetteInnerInfos from "../Transitions/VignetteInnerInfos";

function safeDuration (d) {
  if (isNaN(d)) return 100;
  if (d <= 0) return 100;
  return d;
}

var TransitionPicker = React.createClass({

  propTypes: {
    // N.B.: value is a more rich type that the onChange callback value!
    value: React.PropTypes.shape({
      name: React.PropTypes.string,
      glsl: React.PropTypes.string,
      uniforms: React.PropTypes.object,
      id: React.PropTypes.string
    }).isRequired,
    onChange: React.PropTypes.func.isRequired,
    overlayBounds: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,

    transitionDuration: React.PropTypes.number,
    transitionEasing: React.PropTypes.func,
    transitionUniforms: React.PropTypes.object,
    images: React.PropTypes.arrayOf(React.PropTypes.string),
    transitionCollection: React.PropTypes.array
  },

  getInitialState: function () {
    return {
      opened: false
    };
  },

  onOverlayOutClick: function () {
    this.setState({
      opened: false
    });
  },
  onTransitionOpenPicker: function () {
    this.setState({
      opened: !this.state.opened
    });
  },

  onTransitionSelected: function (tname) {
    this.setState({
      opened: false
    });
    this.props.onChange(tname);
  },

  render: function () {
    const {
      images,
      transitionCollection
    } = this.props;
    var opened = this.state.opened;
    var t = this.props.value;
    var vignetteWidth = this.props.width;
    var vignetteHeight = this.props.height;
    var vignetteButtonSize = vignetteHeight / 2;
    var vignetteButtonStyle = {
      position: "absolute",
      left: ((vignetteWidth-vignetteButtonSize)/2)+"px",
      top: ((vignetteHeight-vignetteButtonSize)/2)+"px",
      textShadow: "0px 0.5px 1px #000"
    };

    var vignette = <Vignette
      transitionDuration={safeDuration(this.props.transitionDuration)}
      transitionEasing={this.props.transitionEasing}
      autostart={false}
      controlsMode="none"
      glsl={t.glsl}
      uniforms={this.props.transitionUniforms || t.uniforms}
      images={images}
      width={vignetteWidth}
      height={vignetteHeight}>
      <VignetteInnerInfos transition={t} />
      <Icon
        name="pencil-square"
        size={vignetteButtonSize}
        color="#fff"
        onClick={this.onTransitionOpenPicker}
        style={vignetteButtonStyle} />
    </Vignette>;

    var bounds = this.props.overlayBounds;

    var overlayStyle = {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: opened ? "block" : "none",
      zIndex: 1000,
      background: "rgba(0,0,0,0.5)"
    };

    var overlayPopin;

    if (opened) {
      var overlayPopinStyle = {
        position: "absolute",
        left: bounds[0]+"px",
        top: bounds[1]+"px",
        background: "#fff",
        zIndex: 1001
      };
      overlayPopin =
        <div style={overlayPopinStyle}>
          <Transitions
            width={bounds[2]}
            height={bounds[3]}
            images={images}
            onTransitionSelected={this.onTransitionSelected}
            transitionCollection={transitionCollection}
          />
        </div>;
    }

    return <div style={{ position: "relative" }}>
      {vignette}
      <div style={overlayStyle} onClick={this.onOverlayOutClick} />
      {overlayPopin}
    </div>;
  }
});

module.exports = TransitionPicker;
