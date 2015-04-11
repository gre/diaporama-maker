/*
 * TODO:
 * display folders instead of flattened?
 */

var React = require("react");
var _ = require("lodash");
var Qajax = require("qajax");
var Combokeys = require("combokeys");
var boundToStyle = require("../../core/boundToStyle");
var isImage = require("../../../common/isImage");
var toProjectUrl = require("../../core/toProjectUrl");
var LibraryImage = require("../LibraryImage");
var PromiseMixin = require("../../mixins/PromiseMixin");

var thumbnailWidth = 120;
var thumbnailHeight = 100;
var itemMarginW = 2;

var GRID_LEFT = 7;
var GRID_TOP = 31;
var GRID_W = thumbnailWidth + 2 * itemMarginW;
var GRID_H = thumbnailHeight;

function indexOfSelected (selected, item) {
  return _.findIndex(selected, function (sel) {
    return sel.file === item.file;
  });
}

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

  mixins: [PromiseMixin],

  getInitialState: function () {
    return {
      items: [],
      selected: [],
      down: null,
      move: null
    };
  },

  getDragItems: function (primaryItem) {
    var all = _.uniq((primaryItem ? [ primaryItem ] : []).concat(this.state.selected), function (i) {
      return i.file;
    });
    return {
      primary: primaryItem,
      all: all
    };
  },

  selectAll: function () {
    this.setState({
      selected: _.clone(this.state.items)
    });
  },

  unselectAll: function () {
    this.setState({
      selected: []
    });
  },

  tapItem: function (item) {
    var copy = _.clone(this.state.selected);
    var i = indexOfSelected(copy, item);
    if (i === -1) {
      copy.push(item);
    }
    else {
      copy.splice(i, 1);
    }
    this.setState({
      selected: copy
    });
  },

  componentWillUnmount: function () {
    this.combokeys.reset();
  },

  componentDidMount: function () {
    this.sync();
    var ck = this.combokeys = new Combokeys(document);

    ck.bind("command+a", function () {
      this.selectAll();
      return false;
    }.bind(this));
    ck.bind("command+shift+a", function () {
      this.unselectAll();
      return false;
    }.bind(this));
  },

  getEventPosition: function (e) {
    var bounds = this.getDOMNode().getBoundingClientRect();
    var node = this.refs.scrollcontainer.getDOMNode();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    var scrollTop = node.scrollTop;
    y += scrollTop;
    return [ x, y ];
  },

  positionToGrid: function (p) {
    return [
      Math.floor((p[0]-GRID_LEFT)/GRID_W),
      Math.floor((p[1]-GRID_TOP)/GRID_H)
    ];
  },

  getGridWidth: function () {
    return Math.floor((this.props.width-GRID_LEFT)/GRID_W);
  },

  selectionMouseDown: function (e) {
    this.setState({
      down: this.getEventPosition(e),
      selected: []
    });
  },

  selectionMouseMove: function (e) {
    var items = this.state.items;
    var down = this.state.down;
    var move = this.getEventPosition(e);
    var downGrid = this.positionToGrid(down);
    var moveGrid = this.positionToGrid(move);
    var gridw = this.getGridWidth();
    var x = Math.max(0, Math.min(downGrid[0], moveGrid[0]));
    var y = Math.max(0, Math.min(downGrid[1], moveGrid[1]));
    var w = Math.abs(downGrid[0] - moveGrid[0]);
    var h = Math.abs(downGrid[1] - moveGrid[1]);
    var x2 = Math.min(x + w, gridw - 1);
    var y2 = y + h;
    var selected = [];
    for (var xi=x; xi<=x2; ++xi) {
      for (var yi=y; yi<=y2; ++yi) {
        var i = xi + yi * gridw;
        var item = items[i];
        if (item) selected.push(item);
      }
    }
    this.setState({
      move: move,
      selected: selected
    });
  },

  selectionMouseUp: function () {
    this.setState({
      down: null,
      move: null
    });
  },

  selectionMouseLeave: function () {
    this.setState({
      down: null,
      move: null
    });
  },

  sync: function () {
    Qajax({
      method: "GET",
      url: "/listfiles"
    })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(filesToItems)
    .then(function (items) {
      return { items: items };
    })
    .then(this.setStateQ)
    .fail(this.recoverUnmountedQ)
    .done();
  },

  componentWillUpdate: function () {
    this.scrollTop = !this.refs.scrollcontainer ? 0 : this.refs.scrollcontainer.getDOMNode().scrollTop;
  },

  render: function () {
    var width = this.props.width;
    var height = this.props.height;
    var usedImages = this.props.usedImages;
    var scrollTop = this.scrollTop;

    var headerHeight = 32;
    var contentHeight = (height - headerHeight);

    var down = this.state.down;
    var move = this.state.move;
    var selectionStyle;
    if (down && move) {
      var x = Math.min(down[0],move[0]);
      var y = Math.min(down[1],move[1]) - scrollTop;
      var w = Math.abs(down[0]-move[0]);
      var h = Math.abs(down[1]-move[1]);
      selectionStyle = _.extend({
        zIndex: 100,
        pointerEvents: "none",
        display: "block",
        border: "1px solid #fc0",
        background: "rgba(255,200,0,0.4)"
      }, boundToStyle({ x: x, y: y, width: w, height: h }));
    }
    else {
      selectionStyle = {
        display: "none"
      };
    }

    var scrollContainerStyle = {
      position: "relative",
      overflow: "auto",
      padding: "1px 5px",
      height: contentHeight+"px",
      width: width+"px",
      background: "#fff"
    };

    var bgMouseEventsStyle = {
      zIndex: down ? 101 : 0,
      position: "absolute",
      left: 0,
      top: 0,
      width: width+"px",
      height: height+"px"
    };

    var gridW = this.getGridWidth();

    var items =
      this.state.items.map(function (item, i) {
        if (item.type === "image") {
          var xi = (i % gridW);
          var yi = Math.floor(i / gridW);
          var itemStyle = {
            margin: "0 "+itemMarginW+"px",
            position: "absolute",
            top: (GRID_H * yi) + "px",
            left: (GRID_W * xi) + "px"
          };
          return <LibraryImage
            key={item.file}
            width={thumbnailWidth}
            height={thumbnailHeight}
            style={itemStyle}
            item={item}
            used={_.filter(usedImages, function (f) { return f === item.file; }).length}
            getDragItems={this.getDragItems}
            onDropped={this.unselectAll}
            onClick={this.tapItem.bind(null, item)}
            selected={indexOfSelected(this.state.selected, item)!==-1}
          />;
        }
        else
          return <span style={{font: "8px normal monospace"}}>No Preview</span>; // TODO
      }, this);

    var mouseEvents;
    if (down) {
      mouseEvents = {
        onMouseMove: this.selectionMouseMove,
        onMouseUp: this.selectionMouseUp,
        onMouseLeave: this.selectionMouseLeave
      };
    }
    else {
      mouseEvents = {
        onMouseDown: this.selectionMouseDown
      };
    }

    return <div
      className="library"
      style={{ width: width+"px", height: height+"px" }}>
      <h2>Library</h2>
      <div ref="scrollcontainer" style={scrollContainerStyle}>
        {items}
      </div>
      <div style={bgMouseEventsStyle} {...mouseEvents}></div>
      <div style={selectionStyle}></div>
    </div>;
  }
});

module.exports = Library;
