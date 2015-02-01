
var React = require("react");
var Thumbnail = require("../Thumbnail");
var Icon = require("../Icon");

var LibraryImage = React.createClass({

  render: function () {
    var width = this.props.width;
    var height = this.props.height;
    var item = this.props.item;
    var used = this.props.used;
    return <div className="library-image item" title={item.file} style={{ width: width+"px", opacity: used ? 0.6 : 1 }}>
      <Thumbnail width={width} height={height} src={item.url} />
      <div className="actions">
        <Icon name="level-down" color="#fff" onClick={this.props.onAddToTimeline} />
      </div>
      <span className="name">{item.file}</span>
    </div>;
  }

});

module.exports = LibraryImage;
