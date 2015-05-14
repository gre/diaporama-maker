/*
 * TODO:
 * display folders instead of flattened?
 */

import React from "react";
import _ from "lodash";
import Combokeys from "combokeys";
import {DragDropMixin, NativeDragItemTypes} from 'react-dnd';
import boundToStyle from "../../core/boundToStyle";
import LibraryItemThumbnail from "../LibraryItemThumbnail";
import PromiseMixin from "../../mixins/PromiseMixin";
import acceptedImageMimetypes from "../../../common/acceptedImageMimetypes.json";
import {SCROLL_BAR_W} from "../../constants";

var thumbnailWidth = 140;
var thumbnailHeight = 100;
var itemMargin = 4;

var GRID_LEFT = 7;
var GRID_TOP = 4;
var GRID_W = thumbnailWidth + 2 * itemMargin;
var GRID_H = thumbnailHeight + 2 * itemMargin;

function indexOfSelected (selected, item) {
  return _.findIndex(selected, function (sel) {
    return sel.id === item.id;
  });
}

var Library = React.createClass({

  mixins: [ PromiseMixin, DragDropMixin ],

  statics: {
    configureDragDrop(register) {
      register(NativeDragItemTypes.FILE, {
        dropTarget: {
          acceptDrop(component, item) {
            const files = item.files.filter(file => acceptedImageMimetypes.indexOf(file.type) !== -1);
            DiaporamaMakerAPI.uploadFiles(files);
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
    var all = _.uniq((primaryItem ? [ primaryItem ] : []).concat(this.state.selected), function (i) {
      return i.id;
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
    return Math.floor((this.props.width-GRID_LEFT-SCROLL_BAR_W)/GRID_W);
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
    // FIXME abstract into a call to a prop
    DiaporamaMakerAPI.listItems()
    .then(function (items) {
      return {
        items: [
          {
            id: "_empty_slide",
            slide2d: {
              background: "#eee",
              size: [800,600],
              draws: [
                { fillStyle: "#000", font: "bold 80px Arial", textAlign: "center" },
                [ "fillText", "Big Text Title...", 400, 200 ],
                { fillStyle: "#666", font: "italic 40px Arial", textAlign: "center" },
                [ "fillText", "Sub Title...", 400, 300 ]
              ]
            }
          }
        ].concat(items)
      };
    })
    .then(this.setStateQ)
    .fail(this.recoverUnmountedQ)
    .done();
  },

  componentWillUpdate: function () {
    this.scrollTop = !this.refs.scrollcontainer ? 0 : this.refs.scrollcontainer.getDOMNode().scrollTop;
  },

  render: function () {
    const {
      width,
      height,
      usedImages
    } = this.props;
    const {
      down,
      move
    } = this.state;
    const scrollTop = this.scrollTop;
    const contentHeight = height;

    let selectionStyle;
    if (down && move) {
      const x = Math.min(down[0],move[0]);
      const y = Math.min(down[1],move[1]) - scrollTop;
      const w = Math.abs(down[0]-move[0]);
      const h = Math.abs(down[1]-move[1]);
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

    const scrollContainerStyle = {
      position: "relative",
      padding: "1px 5px",
      height: contentHeight+"px",
      width: width+"px",
      background: "#fff",
      overflow: "auto"
    };

    const bgMouseEventsStyle = {
      zIndex: down ? 101 : 0,
      position: "absolute",
      left: 0,
      top: 0,
      width: width+"px",
      height: height+"px"
    };

    const gridW = this.getGridWidth();

    const items =
      this.state.items
      .map(function (item, i) {
        const xi = (i % gridW);
        const yi = Math.floor(i / gridW);
        const itemStyle = {
          position: "absolute",
          top: (GRID_TOP + GRID_H * yi) + "px",
          left: (GRID_W * xi) + "px"
        };
        return <LibraryItemThumbnail
          key={item.id}
          width={thumbnailWidth}
          height={thumbnailHeight}
          style={itemStyle}
          item={item}
          used={_.filter(usedImages, function (f) { return f && item.image && f === item.image; }).length}
          getDragItems={this.getDragItems}
          onDropped={this.unselectAll}
          onClick={this.tapItem.bind(null, item)}
          selected={indexOfSelected(this.state.selected, item)!==-1}
        />;
      }, this);


    let mouseEvents;
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
      {...this.dropTargetFor(NativeDragItemTypes.FILE)}
      className="library"
      style={{ width: width+"px", height: height+"px" }}>
      <div ref="scrollcontainer" style={scrollContainerStyle}>
        {items}
      </div>
      <div style={bgMouseEventsStyle} {...mouseEvents}></div>
      <div style={selectionStyle}></div>
    </div>;
  }
});

module.exports = Library;
