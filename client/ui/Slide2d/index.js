import React from "react";
import Slide2dRenderer from "slide2d";
import _ from "lodash";

export default class Slide2d extends React.Component {
  componentDidMount() {
    this.ctx = Slide2dRenderer(
      React.findDOMNode(this).getContext("2d"),
      DiaporamaMakerAPI.toProjectUrl
    );
    this.ctx.render(this.props.value);
  }

  shouldComponentUpdate (props) {
    const {
      width,
      height,
      style,
      value
    } = this.props;
    return (
      width !== props.width ||
      height !== props.height ||
      value !== props.value ||
      !_.isEqual(style, props.style)
    );
  }

  componentDidUpdate () {
    this.ctx.render(this.props.value);
  }

  render () {
    const {
      width,
      height,
      style
    } = this.props;
    const dpr = window.devicePixelRatio || 1;
    const styles = _.extend({
      width: width+"px",
      height: height+"px"
    }, style);
    return <canvas width={width*dpr} height={height*dpr} style={styles} />;
  }
}
