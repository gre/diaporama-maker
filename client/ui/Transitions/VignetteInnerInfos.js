import React from "react";

export default class VignetteInnerInfos extends React.Component {
  render () {
    const transition = this.props.transition;
    const style = {
      position: "absolute",
      width: "100%",
      height: "100%"
    };
    const nameStyle = {
      textDecoration: "none",
      color: "#fff",
      fontSize: "0.8em",
      fontWeight: 400,
      textShadow: "0px 0.5px 1px #000",
      position: "absolute",
      top: "2px",
      left: "6px",
      overflow: "hidden",
      width: "99%",
      whiteSpace: "nowrap",
    };
    const authorStyle = {
      textDecoration: "none",
      fontWeight: "300",
      fontSize: "0.7em",
      color: "#fff",
      textShadow: "0px 0px 1px #000",
      position: "absolute",
      bottom: "2px",
      left: "0px",
      textAlign: "center",
      width: "100%",
      overflow: "hidden",
      whiteSpace: "nowrap"
    };
    const usedStyle = {
      position: "absolute",
      bottom: "3px",
      right: "3px",
      color: "#fc0",
      zIndex: 3,
      fontSize: "0.8em"
    };
    const divergedStyle = {
      position: "absolute",
      top: "3px",
      right: "3px",
      color: "#f00",
      zIndex: 3,
      fontSize: "0.8em",
      textTransform: "uppercase",
      fontFamily: "monospace"
    };
    return <div style={style}>
      <a
        style={nameStyle}
        href={transition.id ? ("https://glsl.io/transition/"+transition.id) : undefined}
        target="_blank">{transition.name}</a>
      <a
        style={authorStyle}
        href={"https://glsl.io/user/"+transition.owner}
        target="_blank">by <em>{transition.owner}</em></a>
      {transition.usedCount ?
        <span style={usedStyle}>{transition.usedCount}×</span>
        : undefined
      }
      {transition.diverged ?
      <span style={divergedStyle}>diverged</span>
      : undefined}
    </div>;
  }
}
