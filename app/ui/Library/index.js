var React = require("react");
var Q = require("q");
var _ = require("lodash");
var Qajax = require("qajax");
var boundToStyle = require("../../core/boundToStyle");
var isImage = require("../../../common/isImage");
var toProjectUrl = require("../../core/toProjectUrl");
var Thumbnail = require("../Thumbnail");
var LibraryImage = require("../LibraryImage");

var m = React.createElement;

var thumbnailWidth = 120;
var thumbnailHeight = 80;

function filesToItems (files) {
  return files.map(function (file) {
    if (isImage(file))
      return {
        file: file,
        url: toProjectUrl(file),
        type: "image"
      };
    else
      return {
        file: file,
        url: toProjectUrl(file),
        type: ""
      };
  });
}

var Library = React.createClass({

  getInitialState: function () {
    return {
      items: []
    };
  },

  componentDidMount: function () {
    this.sync();
  },

  sync: function () {
    var self = this;
    Qajax({
      method: "GET",
      url: "/listfiles"
    })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(filesToItems)
    .then(function (items) {
      self.setState({ items: items });
    })
    .done();
  },

  onAddToTimeline: function (item) {
    this.props.onAddToTimeline(item);
  },

  render: function () {
    var width = this.props.width;
    var height = this.props.height;
    var usedImages = this.props.usedImages;

    var headerHeight = 40;
    var contentHeight = (height - headerHeight);

    var self = this;
    var items =
      this.state.items.map(function (item) {
        function onAddToTimeline () {
          self.onAddToTimeline(item.file);
        }
        if (item.type === "image") {
          return <LibraryImage key={item.file} item={item} used={_.contains(usedImages, item.file)} width={thumbnailWidth} height={thumbnailHeight} onAddToTimeline={onAddToTimeline} />
        }
        else
          return <span style={{font: "8px normal monospace"}}>No Preview</span>; // TODO
      });

    return <div className="library" style={{ width: width+"px", height: height+"px" }}>
      <h2>Library</h2>
      <div className="body" style={{ height: contentHeight+"px" }}>
        {items}
      </div>;
    </div>;
  }
});

module.exports = Library;
