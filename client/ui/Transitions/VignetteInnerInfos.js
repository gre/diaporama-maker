import React from "react";

export default class VignetteInnerInfos extends React.Component {
  render () {
    const props = this.props;
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
    return <div style={style}>
      <a
        style={nameStyle}
        href={props.id ? ("https://glsl.io/transition/"+props.id) : undefined}
        target="_blank">{props.name}</a>
      <a
        style={authorStyle}
        href={"https://glsl.io/user/"+props.owner}
        target="_blank">by <em>{props.owner}</em></a>
    </div>;
  }
}
