var React = require("react");
var _ = require("lodash");

var BezierEditor = require("bezier-easing-editor");
var images = require("../../resource/images");
var DurationInput = require("../DurationInput");
var Icon = require("../Icon");
var Button = require("../Button");
var toProjectUrl = require("../../core/toProjectUrl");

import {KenburnsEditor} from "kenburns-editor";

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
      var image = value.image && toProjectUrl(value.image) || images.fromImage;
      var interPadding = 10;
      var w1 = Math.floor(width * 0.6);
      var w2 = width - w1;
      var h = Math.min(240, w2);
      var paddingW = (w2 - h) / 2;
      return <div>
        <div key="l" style={{ display: "inline-block", marginRight: interPadding+"px" }}>
        <KenburnsEditor
          value={value.kenburns}
          onChange={this.onChangeKenburns}
          width={w1-interPadding}
          height={h}
          image={image}
          background="#000"
        />
        </div>
        <div key="r" style={{ display: "inline-block" }}>
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

var croppingModesKeys = Object.keys(croppingModes);

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

  onRemove: function (e) {
    e.preventDefault();
    this.props.onRemove();
  },

  render: function () {
    const {
      value,
      width,
      onRemove
    } = this.props;
    var modeId = "kenburns" in value ? "kenburns" : "fitcenter";

    var modes = [];
    var i=0;
    for (var k in croppingModes) {
      var m = croppingModes[k];
      var selected = k===modeId;
      var first = i===0;
      var last = (++i)===croppingModesKeys.length;
      var lb = first ? "4px" : "0px";
      var rb = last ? "4px" : "0px";
      var style = {
        borderRadius: lb+" "+rb+" "+rb+" "+lb
      };
      var mode = <Button
        key={k}
        color={selected ? "#fff" : "#000"}
        bg={selected ? "#000" : "#aaa"}
        bgHover={selected ? "#000" : "#ddd"}
        onClick={this.selectMode.bind(null, k)}
        style={style}
      >
        <Icon name="crop" />&nbsp;{m.title}
      </Button>;
      modes.push(mode);
    }

    var render = croppingModes[modeId].render;

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
        title="Image Duration:"
        value={value.duration}
        onChange={this.onChangeDuration}
        width={width} />
      <div>{modes}</div>
      {!render ? undefined : render.call(this)}
    </div>;
  }
});

module.exports = ImageCustomizer;
