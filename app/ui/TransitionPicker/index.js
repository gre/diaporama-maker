var React = require("react");
var Q = require("q");
var Qimage = require("qimage");
var Transitions = require("../Transitions");
var Vignette = require("glsl.io-client/src/ui/Vignette");
var images = require("../../resource/images");
var Icon = require("../Icon");

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
      uniforms: React.PropTypes.object
    }).isRequired,
    onChange: React.PropTypes.func.isRequired,
    overlayBounds: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,

    transitionDuration: React.PropTypes.number,
    transitionEasing: React.PropTypes.func,
    transitionUniforms: React.PropTypes.object,
    images: React.PropTypes.arrayOf(React.PropTypes.string),
    animated: React.PropTypes.bool
  },

  componentWillMount: function () {
    this.images = [ images.fromImage, images.toImage ];
    if (this.props.images) {
      Q .all(this.props.images.map(Qimage.anonymously))
        .then(function (images) {
          this.images = images;
          this.forceUpdate();
        }.bind(this))
        .done();
    }
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
      autostart={!!this.props.animated}
      controlsMode={"none"}
      glsl={t.glsl}
      uniforms={this.props.transitionUniforms || t.uniforms}
      images={this.images}
      width={vignetteWidth}
      height={vignetteHeight}>
      <span className="tname">{t.name}</span>
      <Icon name="pencil-square" size={vignetteButtonSize} color="#fff" onClick={this.onTransitionOpenPicker} style={vignetteButtonStyle} />
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
    var overlayPopinStyle = {
      position: "absolute",
      display: opened ? "block" : "none",
      left: bounds[0]+"px",
      top: bounds[1]+"px",
      background: "#fff",
      zIndex: 1001
    };

    return <div style={{ position: "relative" }}>
      {vignette}
      <div style={overlayStyle} onClick={this.onOverlayOutClick}>
      </div>
      <div style={overlayPopinStyle}>
        <Transitions
          width={bounds[2]}
          height={bounds[3]}
          onTransitionSelected={this.onTransitionSelected}
        />
      </div>
    </div>;
  }
});

module.exports = TransitionPicker;
