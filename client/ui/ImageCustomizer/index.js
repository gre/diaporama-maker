import React from "react";
import _ from "lodash";
import BezierEditorAndPicker from "../BezierEditorAndPicker";
import BezierEasing from "bezier-easing";
import DurationInput from "../DurationInput";
import Icon from "../Icon";
import Button from "../Button";
import {KenburnsEditor} from "kenburns-editor";

const croppingModes = {
  fitcenter: {
    title: "Fit Center",
    render () {
      return <blockquote>
        <strong>Fit Center</strong> preserves the image ratio regardless of the diaporama resolution.
        It uses the biggest centered crop of the image.
      </blockquote>;
    }
  },
  kenburns: {
    title: "KenBurns effect",
    render () {
      const {
        value,
        width,
        progress
      } = this.props;
      const image = value.image && DiaporamaMakerAPI.toProjectUrl(value.image) || DiaporamaMakerAPI.fromImage;
      const interPadding = 10;
      const w1 = Math.floor(width * 0.5);
      const w2 = width - w1;
      const h = Math.min(240, w2);
      const progressEasing = this.easing && this.easing(progress) || progress;
      return <div>
        <div key="l" style={{ display: "inline-block", marginRight: interPadding+"px" }}>
        <KenburnsEditor
          value={value.kenburns}
          onChange={this.onChangeKenburns}
          width={w1-interPadding}
          height={h}
          image={image}
          background="#000"
          progress={progressEasing}
          fromColor={[0, 170, 255]}
          toColor={[255, 170, 0]}
          progressColor={[0, 0, 0]}
          overlayFill="rgba(0,0,0,0.5)"
          centerTextStyle={{
            textShadow: "0px 1px 0px #fff"
          }}
        />
        </div>
        <div key="r" style={{ display: "inline-block" }}>
        <BezierEditorAndPicker
          value={value.kenburns.easing}
          onChange={this.onChangeKenburnsEasing}
          width={w2-10}
          height={h}
          progress={progress}
        />
        </div>
      </div>;
    }
  }
};

const croppingModesKeys = Object.keys(croppingModes);

const ImageCustomizer = React.createClass({

  propTypes: {
    value: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    width: React.PropTypes.number.isRequired,
    displayDuration: React.PropTypes.bool
  },

  onChangeKenburns (value) {
    const prev = this.props.value;
    this.props.onChange(_.defaults({ kenburns: _.extend({}, prev.kenburns, value) }, prev));
  },

  onChangeKenburnsEasing (value) {
    const prev = this.props.value;
    this.props.onChange(_.defaults({ kenburns: _.defaults({ easing: value }, prev.kenburns) }, prev));
  },

  onChangeDuration (value) {
    this.props.onChange(_.defaults({ duration: value }, this.props.value));
  },

  selectMode (mode, e) {
    e.preventDefault();
    const clone = _.clone(this.props.value);
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

  onRemove (e) {
    e.preventDefault();
    this.props.onRemove();
  },

  componentWillMount () {
    this.genEasing(this.props);
  },

  genEasing (props) {
    const oldValue = this.props.value.kenburns && this.props.value.kenburns.easing;
    const value = props.value.kenburns && props.value.kenburns.easing;
    if (value) {
      if (!this.easing || !_.isEqual(value, oldValue)) {
        this.easing = BezierEasing.apply(null, value);
      }
    }
    else {
      this.easing = null;
    }
  },

  componentWillReceiveProps (props) {
    this.genEasing(props);
  },

  render () {
    const {
      value,
      width,
      displayDuration
    } = this.props;
    const modeId = "kenburns" in value ? "kenburns" : "fitcenter";

    const modes = [];
    var i=0;
    for (let k in croppingModes) {
      const m = croppingModes[k];
      const selected = k===modeId;
      const first = i===0;
      const last = (++i)===croppingModesKeys.length;
      const lb = first ? "4px" : "0px";
      const rb = last ? "4px" : "0px";
      const style = {
        borderRadius: lb+" "+rb+" "+rb+" "+lb
      };
      const mode = <Button
        key={k}
        color={selected ? "#fff" : "#000"}
        bg={selected ? "#000" : "#ccc"}
        bgHover={selected ? "#000" : "#eee"}
        onClick={this.selectMode.bind(null, k)}
        style={style}
      >
        <Icon name="crop" />&nbsp;{m.title}
      </Button>;
      modes.push(mode);
    }

    const render = croppingModes[modeId].render;

    return <div>
      {!displayDuration ? undefined :
      <DurationInput
        title="Image Duration:"
        value={value.duration}
        onChange={this.onChangeDuration}
        width={width} />
      }
      <div>{modes}</div>
      {!render ? undefined : render.call(this)}
    </div>;
  }
});

module.exports = ImageCustomizer;
