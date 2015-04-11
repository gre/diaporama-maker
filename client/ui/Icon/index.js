import React from "react";
import _ from "lodash";

export default class Icon extends React.Component {

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
      style,
      color,
      size,
      onClick,
      colorHover,
      name
    } = this.props;
    const {
      hover
    } = this.state;
    var styles = style || {};
    if (color) {
      styles.color = color;
    }
    if (size) {
      styles.fontSize = size + "px";
    }
    if (onClick) {
      styles.cursor = "pointer";
    }
    if (colorHover && hover) {
      styles.color = colorHover;
    }
    var props = _.clone(this.props);
    delete props.style;
    delete props.color;
    delete props.size;
    delete props.name;
    delete props.colorHover;
    props.onMouseEnter = this.hoverEnter;
    props.onMouseLeave = this.hoverLeave;
    return <i
      className={"fa fa-"+name}
      style={styles}
      {...props}></i>;
  }
}
