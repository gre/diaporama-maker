var React = require("react");
var _ = require("lodash");

var BezierEasing = require("bezier-easing");
var BezierEditor = require("glsl.io-client/src/ui/BezierEditor");
var images = require("../../resource/images");
var DurationInput = require("../DurationInput");
var KenBurnsEditor = require("../KenBurnsEditor");
var Icon = require("../Icon");

var croppingModes = {
  fitcenter: {
    title: "Fit Center",
    render: function () {
      return <blockquote>
        <strong>Fit Center</strong> preserves the image ratio regardless of the diaporama resolution.
        It uses the biggest centered crop of the image.
      </blockquote>;
    }
  },
  kenburns: {
    title: "KenBurns effect",
    render: function () {
      var value = this.props.value;
      var width = this.props.width;
      var interPadding = 10;
      var w1 = Math.floor(width * 0.6);
      var w2 = width - w1;
      var h = Math.min(300, w2);
      var paddingW = (w2 - h) / 2;
      return <div>
        <div style={{ display: "inline-block", marginRight: interPadding+"px" }}>
        <KenBurnsEditor
          value={value.kenburns}
          onChange={this.onChangeKenburns}
          width={w1-interPadding}
          height={h}
          image={images.fromImage.src}
        />
        </div>
        <div style={{ display: "inline-block" }}>
        <BezierEditor
          value={value.kenburns.easing}
          onChange={this.onChangeKenburnsEasing}
          width={w2-10}
          height={h}
          handleRadius={10}
          padding={[10, paddingW, 20, interPadding+10]}
        />
        </div>
      </div>;
    }
  }
};

var ImageCustomizer = React.createClass({
  propTypes: {
    value: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    width: React.PropTypes.number.isRequired
  },
    
  onChangeKenburns: function (value) {
    var prev = this.props.value;
    this.props.onChange(_.defaults({ kenburns: _.extend({}, prev.kenburns, value) }, prev));
  },

  onChangeKenburnsEasing: function (value) {
    var prev = this.props.value;
    this.props.onChange(_.defaults({ kenburns: _.defaults({ easing: value }, prev.kenburns) }, prev));
  },

  onChangeDuration: function (value) {
    this.props.onChange(_.defaults({ duration: value }, this.props.value));
  },

  selectMode: function (mode, e) {
    e.preventDefault();
    var clone = _.clone(this.props.value);
    if (mode === "kenburns") {
      clone.kenburns = {
        from: [ 1, [0.5, 0.5] ],
        to: [ 0.75, [0.5, 0.5] ]
      };
    }
    else {
      delete clone.kenburns;
    }
    this.props.onChange(clone);
  },

  render: function () {
    var value = this.props.value;
    var width = this.props.width;
    var modeId = "kenburns" in value ? "kenburns" : "fitcenter";

    var modes = [];
    for (var k in croppingModes) {
      var m = croppingModes[k];
      var mode = <a href="#" className={k===modeId ? "selected" : ""} onClick={this.selectMode.bind(this, k)}><Icon name="crop" />&nbsp;{m.title}</a>;
      modes.push(mode);
    }

    var render = croppingModes[modeId].render;

    return <div className="image-customizer">
      <DurationInput title="Image Duration:" value={value.duration} onChange={this.onChangeDuration} width={width} />
      <div className="mode-select">{modes}</div>
      {!render ? undefined : render.call(this)}
    </div>;
  }
});

module.exports = ImageCustomizer;
