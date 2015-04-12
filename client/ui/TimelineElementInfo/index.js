import React from "react";

export default class TimelineElementInfo extends React.Component {
  constructor (props) {
    super(props);
    this.loadImage(props);
  }
  loadImage (props) {
    var src = props.value.image;
    if (this.img) {
      delete this.img.src;
      delete this.img.onload;
    }
    this.img = new window.Image();
    this.img.src = DiaporamaMakerAPI.toProjectUrl(src, true);
    this.img.onload = () => this.forceUpdate();
  }
  componentWillUpdate (props) {
    if (!this.img || this.props.value.image !== props.value.image)
      this.loadImage(props);
  }
  render () {
    const {
      value
    } = this.props;
    const img = this.img;
    const loaded = img.width;

    const style = {
      textAlign: "center"
    };
    const dlStyle = {
      margin: 0,
      display: "inline-block",
      marginRight: "20px",
      fontSize: "1em",
      color: "#999"
    };
    const dtStyle = {
      display: "inline-block",
      boxSizing: "border-box",
      padding: "0 5px 0 0",
      margin: 0,
      fontWeight: "bold",
      textAlign: "right"
    };
    const ddStyle = {
      display: "inline-block",
      boxSizing: "border-box",
      padding: 0,
      margin: 0,
      fontFamily: "monospace",
      minWidth: "80px",
      textAlign: "left"
    };

    return <div style={style}>
      <dl style={dlStyle}>
        <dt style={dtStyle}>File:</dt>
        <dd style={ddStyle}>{value.image}</dd>
      </dl>
      <dl style={dlStyle}>
        <dt style={dtStyle}>Size:</dt>
        { loaded ?
          <dd style={ddStyle}>{img.width}×{img.height}</dd> :
          <dd style={ddStyle}>...</dd>
        }
      </dl>
    </div>;
  }
}
