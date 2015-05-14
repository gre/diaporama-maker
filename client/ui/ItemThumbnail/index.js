import React from "react";
import ImageThumbnail from "../ImageThumbnail";
import Slide2d from "../Slide2d";

export default class LibraryItem extends React.Component {

  render () {
    const {
      item,
      width,
      height,
      style
    } = this.props;

    if (item.image) {
      return <ImageThumbnail
        image={DiaporamaMakerAPI.toProjectUrl(item.image)}
        style={style}
        width={width}
        height={height} />;
    }

    if (item.slide2d) {
      return <Slide2d
        value={item.slide2d}
        style={style}
        width={width}
        height={height}
      />;
    }

    return (
      <div style={style}>
        <span style={{font: "8px normal monospace"}}>No Preview</span>
      </div>
    );
  }
}

LibraryItem.defaultProps = {
  style: {}
};
