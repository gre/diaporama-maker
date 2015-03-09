var React = require("react");
var _ = require("lodash");
var Thumbnail = require("../Thumbnail");
var DraggableMixin = require("../../mixins/DraggableMixin");

var LibraryImage = React.createClass({

  mixins: [ DraggableMixin ],

  getDefaultProps: function () {
    return {
      used: 0
    };
  },

  render: function () {
    var width = this.props.width;
    var height = this.props.height;
    var item = this.props.item;
    var used = this.props.used;
    var dragging = this.props.dragging;

    var style = _.extend({
      width: width+"px"
    }, this.props.style||{});
    
    var thumbnailStyle = {
      opacity: !used ? 1 : 0.5
    };

    var border = dragging ? 1 : 2;
    var thumbnailContainerStyle = {
      backgroundColor: "#000",
      border: border+"px solid",
      borderColor: dragging||used ? "#000" : "#FC0",
      boxShadow: !dragging ? "" : "0px 1px 12px rgba(0,0,0,1)"
    };

    var countUsageStyle = {
      position: "absolute",
      bottom: "22px",
      right: "6px",
      color: "#fff",
      zIndex: 2,
      fontSize: "0.8em"
    };

    var titleStyle = {
      display: "inline-block",
      width: "100%",
      fontSize: "0.8em",
      fontWeight: 300,
      color: used ? "#666" : "#d80",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    };
    
    return <div
      className="library-image item"
      title={item.file}
      style={style}
      {...this.draggableProps()}
    >
      { !used ? undefined :
        <span style={countUsageStyle}>
          {used}
          ×
        </span>}
      <div style={thumbnailContainerStyle}>
        <Thumbnail style={thumbnailStyle} width={width-2*border} height={height-2*border} image={item.url} />
      </div>
      { dragging ? undefined :
      <span style={titleStyle}>{item.file}</span>
      }
    </div>;
  }

});

module.exports = LibraryImage;
