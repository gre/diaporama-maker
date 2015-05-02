import React from "react";

export default class VignetteInnerInfos extends React.Component {
  render () {
    const transition = this.props.transition;
    const style = {
      position: "absolute",
      width: "100%",
      height: "100%"
    };
    const gradientSteps =
      "rgba(0,0,0,0), rgba(0,0,0,0.8) 25%, rgba(0,0,0,0.8)";

    const nameStyle = {
      textDecoration: "none",
      color: "#fff",
      fontSize: "0.8em",
      fontWeight: 400,
      textShadow: "0px 0.5px 1px #000",
      position: "absolute",
      top: 0,
      left: 0,
      overflow: "hidden",
      width: "100%",
      padding: "2px 6px 6px 6px",
      whiteSpace: "nowrap",
      background: "linear-gradient(0deg, "+gradientSteps+")"
    };
    const authorStyle = {
      textDecoration: "none",
      fontWeight: "300",
      fontSize: "0.7em",
      color: "#fff",
      textShadow: "0px 0px 1px #000",
      position: "absolute",
      bottom: 0,
      left: 0,
      padding: "6px 6px 2px 6px",
      textAlign: "center",
      width: "100%",
      overflow: "hidden",
      whiteSpace: "nowrap",
      background: "linear-gradient(180deg, "+gradientSteps+")"
    };
    const usedStyle = {
      position: "absolute",
      top: "1px",
      right: "3px",
      color: "#fc0",
      zIndex: 3,
      fontSize: "0.8em"
    };
    const divergedStyle = {
      position: "absolute",
      top: "1px",
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
