import React from "react";
import _ from "lodash";
import boundToStyle from "../../core/boundToStyle";
import GlslTransitions from "glsl-transitions";
import DiaporamaElement from "../DiaporamaElement";
import Icon from "../Icon";

export default class Viewer extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      hover: false
    };
    this.hoverEnter = this.hoverEnter.bind(this);
    this.hoverLeave = this.hoverLeave.bind(this);
  }

  hoverEnter () {
    this.setState({
      hover: true
    });
  }

  hoverLeave () {
    this.setState({
      hover: false
    });
  }

  render () {
    const {
      bound,
      playing
    } = this.props;
    const {
      hover
    } = this.state;

    const style = _.extend({
      background: "#000",
      color: "#fff"
    }, boundToStyle(bound));

    const h2Style = {
      zIndex: 3,
      position: "absolute",
      top: 0,
      left: 0
    };

    const playPauseSize = 40;
    const playPauseStyle = {
      position: "absolute",
      left: ((bound.width-playPauseSize)/2)+"px",
      top: ((bound.height-playPauseSize)/2)+"px"
    };

    const hoverOverlayStyle = {
      zIndex: 2,
      opacity: hover ? 1 : 0,
      transition: hover ? "opacity 0.5s" : "",
      background: "rgba(0,0,0,0.3)",
      textAlign: "center",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%"
    };

    return <div style={style}>
      <DiaporamaElement
        GlslTransitions={GlslTransitions} // TODO: inline the transitions
        width={bound.width}
        height={bound.height}
        data={this.props.diaporama}
        currentTime={this.props.time}
      />
      <div
        onMouseEnter={this.hoverEnter}
        onMouseLeave={this.hoverLeave}
        style={hoverOverlayStyle}
      >
        <h2 style={h2Style}>Viewer</h2>

      { playing ?
        <Icon style={playPauseStyle} size={playPauseSize} onClick={this.props.onPause} name="pause" colorHover="#fc0" color="#fff" />
          :
        <Icon style={playPauseStyle} size={playPauseSize} onClick={this.props.onPlay} name="play" colorHover="#fc0" color="#fff" />
      }
      </div>
    </div>;
  }

}
