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
var DragItems = require("../../constants").DragItems;
var DragDropMixin = require('react-dnd').DragDropMixin;

var thumbnailWidth = 120;
var thumbnailHeight = 100;

function indexOfSelected (selected, item) {
  return _.findIndex(selected, function (sel) {
    return sel.file === item.file;
  });
}

function intersect (a, b) {
    return (a[0] <= b[0]+b[2] &&
          b[0] <= a[0]+a[2] &&
          a[1] <= b[1]+b[3] &&
          b[1] <= a[1]+a[3]);
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
  
  mixins: [DragDropMixin],

  statics: {
    configureDragDrop: function (register) {
      register(DragItems.SLIDE, {
        dropTarget: {
          getDropEffect: function () {
            return "move";
          },
          acceptDrop: function (component, itemPointer) {
            component.props.alterDiaporama("removeItem", itemPointer);
          }
        }
      });
    }
  },

  getInitialState: function () {
    return {
      items: [],
      selected: [],
      down: null,
      move: null
    };
  },

  getDragItems: function (primaryItem) {
    var all = (primaryItem ? [ primaryItem ] : []).concat(this.state.selected);
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

  onMouseDown: function (e) {
    this.setState({
      down: this.getEventPosition(e),
      selected: []
    });
  },

  onMouseMove: function (e) {
    var down = this.state.down;
    var move = this.getEventPosition(e);
    var x = Math.min(down[0],move[0]);
    var y = Math.min(down[1],move[1]);
    var w = Math.abs(down[0]-move[0]);
    var h = Math.abs(down[1]-move[1]);
    var totalW = this.props.width;
    var left = 7;
    var top = 31;
    var tw = 124;
    var th = 100;
    var cols = Math.floor((totalW-left)/tw);
    var sel = [ x, y, w, h ];
    console.log(sel);
    var selected = _.filter(this.state.items, function (item, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var bound = [ left + col * tw, top + row * th, tw, th ];
      return intersect(bound, sel);
    });
    this.setState({
      move: move,
      selected: selected
    });
  },

  onMouseUp: function () {
    this.setState({
      down: null,
      move: null
    });
  },

  onMouseLeave: function () {
    this.setState({
      down: null,
      move: null
    });
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

  render: function () {
    var width = this.props.width;
    var height = this.props.height;
    var usedImages = this.props.usedImages;

    var headerHeight = 40;
    var contentHeight = (height - headerHeight);

    var itemStyle = {
      margin: "0 2px",
      display: "inline-block"
    };

    var down = this.state.down;
    var move = this.state.move;
    var selectionStyle;
    if (down && move) {
      var x = Math.min(down[0],move[0]);
      var y = Math.min(down[1],move[1]);
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

    var bgMouseEventsStyle = {
      zIndex: down ? 101 : 0,
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%"
    };

    var items =
      this.state.items.map(function (item) {
        if (item.type === "image") {
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
        onMouseMove: this.onMouseMove,
        onMouseUp: this.onMouseUp,
        onMouseLeave: this.onMouseLeave
      };
    }
    else {
      mouseEvents = {
        onMouseDown: this.onMouseDown
      };
    }

    return <div
      {...this.dropTargetFor(DragItems.SLIDE)}
      className="library"
      style={{ width: width+"px", height: height+"px" }}>
      <h2>Library</h2>
      <div ref="scrollcontainer" className="body" style={{ overflow: "auto", padding: "1px 5px", height: contentHeight+"px" }}>
        {items}
        <div style={bgMouseEventsStyle} {...mouseEvents}></div>
      </div>
      <div style={selectionStyle}></div>
    </div>;
  }
});

module.exports = Library;
