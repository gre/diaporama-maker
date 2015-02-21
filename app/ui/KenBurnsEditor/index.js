/**
 * TODO
 * directional line with arrow steps between the 2 centers to also visualize the easing.
 */


var React = require("react");
var _ = require("lodash");
var rectClamp = require("rect-clamp");
var rectMix = require("rect-mix");
var rectCrop = require("rect-crop");
var scaleTranslateStyle = require("../../core/scaleTranslateStyle");
var ImageHolderMixin = require("../../mixins/ImageHolderMixin");

var EDIT_TOPLEFT = 1,
    EDIT_TOPRIGHT = 2,
    EDIT_BOTTOMLEFT = 3,
    EDIT_BOTTOMRIGHT = 4,
    EDIT_MOVE = 5;

function cursorForEdit (s) {
  if (!s) return "pointer";
  if (s === EDIT_MOVE) return "move";
  if (s === EDIT_TOPLEFT || s === EDIT_BOTTOMRIGHT) return "nwse-resize";
  if (s === EDIT_TOPRIGHT || s === EDIT_BOTTOMLEFT) return "nesw-resize";
}

function centerText (p) {
  return Math.round(100*p[0])+"% "+Math.round(100*p[0])+"%";
}

function rectGrow (rect, size) {
  return [
    rect[0] - size[0], rect[1] - size[1],
    rect[2] + 2 * size[0], rect[3] + 2 * size[1] ];
}

function rectRound (rect) {
  return [
    Math.round(rect[0]),
    Math.round(rect[1]),
    Math.round(rect[2]),
    Math.round(rect[3])
  ];
}

function rectContains (rect, point) {
  return rect[0] <= point[0] &&
         point[0] <= rect[0]+rect[2] &&
         rect[1] <= point[1] &&
         point[1] <= rect[1]+rect[3] ;
}

function dot (a, b) {
  return [ a[0] * b[0], a[1] * b[1] ];
}

function distance (a, b) {
  var dx = a[0] - b[0];
  var dy = a[1] - b[1];
  return Math.sqrt(dx*dx+dy*dy);
}

function manhattan (a, b) {
  return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
}

function cornerPath (p, d) {
  return [
    "M", p[0], p[1],
    "L", p[0]+d[0], p[1],
    "L", p[0], p[1]+d[1],
    "z"];
}

var KenBurnsEditorOverlay = React.createClass({
  render: function () {
    var rect = this.props.rect;
    var viewport = this.props.viewport;
    var style = {
      fill: "rgba(0,0,0,0.5)"
    };
    return <g>
      <rect style={style} key="1" x={0} y={0} width={Math.max(0, rect[0])} height={viewport[3]} />
      <rect style={style} key="2" x={rect[0]+rect[2]} y={0} width={Math.max(0, viewport[2]-rect[0]-rect[2])} height={viewport[3]} />
      <rect style={style} key="3" x={rect[0]} y={0} width={Math.max(0, rect[2])} height={Math.max(0, rect[1])} />
      <rect style={style} key="4" x={rect[0]} y={rect[1]+rect[3]} width={Math.max(0, rect[2])} height={Math.max(0, viewport[3]-rect[1]-rect[3])} />
    </g>;
  }
});

var KenBurnsEditorRect = React.createClass({

  render: function () {
    var center = this.props.center;
    var edit = this.props.edit;
    var rect = this.props.rect;
    var name = this.props.name;
    var viewport = this.props.viewport;
    var progress = this.props.progress;
    var size;

    var arrow;
    var corners;
    var title;

    // Center Arrow
    if (center) {
      size = edit ? 5 : 3;
      var arrowStyle = {
        stroke: "rgba(255,255,255,"+(edit ? 1 : 0.5)+")",
        strokeWidth: edit ? 2 : 1
      };
      var arrowTextStyle = {
        fill: "#fff",
        fontSize: 8,
        alignmentBaseline: "text-before-edge"
      };
      arrow = <g>
        <line key="a1" style={arrowStyle} x1={center[0]-size} x2={center[0]+size} y1={center[1]} y2={center[1]} />
        <line key="a2" style={arrowStyle} y1={center[1]-size} y2={center[1]+size} x1={center[0]} x2={center[0]} />
        <text x={center[0]+4} y={center[1]+2} style={arrowTextStyle}>{ this.props.centerText }</text>
      </g>;
    }

    if (edit) {
      // Corners
      size = Math.min(rect[2], rect[3]) / 4;
      var cornerStyle = {
        fill: "#fff",
        stroke: "#fff",
        strokeWidth: 2
      };
      var zoomTextStyle = {
        fill: "#000",
        fontSize: 10,
        textAnchor: "end",
        alignmentBaseline: "text-after-edge"
      };
      var topleftCorner = cornerPath([rect[0],rect[1]], [size, size]);
      var toprightCorner = cornerPath([rect[0]+rect[2],rect[1]], [-size, size]);
      var bottomleftCorner = cornerPath([rect[0],rect[1]+rect[3]], [size, -size]);
      var bottomrightCorner = cornerPath([rect[0]+rect[2],rect[1]+rect[3]], [-size, -size]);
      corners = <g>
        <path key="c1" style={cornerStyle} d={topleftCorner.join(" ")} />
        <path key="c2" style={cornerStyle} d={toprightCorner.join(" ")} />
        <path key="c3" style={cornerStyle} d={bottomleftCorner.join(" ")} />
        <path key="c4" style={cornerStyle} d={bottomrightCorner.join(" ")} />
        <text x={rect[0]+rect[2]} y={rect[1]+rect[3]} style={zoomTextStyle}>{this.props.zoomText}</text>
      </g>;
    }

    if (name) {
      // Title
      var inner = rect[1]+rect[3]+20 > viewport[3];
      var titleStyle = {
        fill: inner ? "#000" : "#fff",
        fontSize: 10,
        textAnchor: "start",
        alignmentBaseline: inner ? "text-after-edge" : "text-before-edge"
      };
      title = <text style={titleStyle} x={rect[0]} y={rect[1]+rect[3]+(inner ? 0 : 2)}>{name}</text>;
    }

    var rectStyle = {
      fill: "none",
      stroke: progress ? "rgba(255,255,255,0.8)" : "#fff",
      strokeWidth: edit ? 2 : 1,
      strokeDasharray: progress ? "1,2" : (edit ? "4,4" : "")
    };
    return <g>
      <rect key="r" style={rectStyle} x={rect[0]} y={rect[1]} width={rect[2]} height={rect[3]} />
      {arrow}
      {corners}
      {title}
    </g>;
  }

});

var KenBurnsEditor = React.createClass({

  mixins: [ ImageHolderMixin ],

  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    image: React.PropTypes.string.isRequired,
    progress: React.PropTypes.number,
    value: React.PropTypes.shape({
      from: React.PropTypes.array,
      to: React.PropTypes.array
    })
  },

  getDefaultProps: function () {
    return {
      value: {
        from: [1, [0.5, 0.5]],
        to: [1, [0.5, 0.5]]
      }
    };
  },

  getInitialState: function () {
    return {
      editFrom: true,
      edit: null,
      downEditFrom: null,
      downAt: null,
      downValue: null,
      downTime: null
    };
  },

  pos: function (e) {
    var bound = this.getDOMNode().getBoundingClientRect();
    var pos = [
      e.clientX - bound.left,
      e.clientY - bound.top
    ];
    if (this.innerRect) {
      pos[0] -= this.innerRect[0];
      pos[1] -= this.innerRect[1];
    }
    return pos;
  },

  onMouseDown: function (e) {
    var pos = this.pos(e);
    var editFrom = this.state.editFrom;
    var newState = {
      downAt: pos,
      downTime: Date.now(),
      downEditFrom: editFrom
    };
    var w = this.innerRect[2];
    var h = this.innerRect[3];
    var r = { width: w, height: h };
    var viewport = [0,0,w,h];
    var selected = this.state.editFrom ? this.props.value.from : this.props.value.to;
    var rect = rectGrow(
      rectClamp(
        rectCrop.apply(null, selected)(r,r),
        viewport
      ),
      [5, 5]
    );

    if (!rectContains(rect, pos)) {
      editFrom = !editFrom;
      selected = editFrom ? this.props.value.from : this.props.value.to;
      rect = rectGrow(
        rectClamp(
          rectCrop.apply(null, selected)(r,r),
          viewport
        ),
        [5, 5]
      );
    }

    if (rectContains(rect, pos)) {
      newState.editFrom = editFrom;
      var mix = [
        (pos[0]-rect[0])/rect[2],
        (pos[1]-rect[1])/rect[3]
      ];
      var cornerMaxDist = 0.5;
      if (manhattan(mix, [0,0]) < cornerMaxDist) {
        newState.edit = EDIT_TOPLEFT;
      }
      else if (manhattan(mix, [1,0]) < cornerMaxDist) {
        newState.edit = EDIT_TOPRIGHT;
      }
      else if (manhattan(mix, [0,1]) < cornerMaxDist) {
        newState.edit = EDIT_BOTTOMLEFT;
      }
      else if (manhattan(mix, [1,1]) < cornerMaxDist) {
        newState.edit = EDIT_BOTTOMRIGHT;
      }
      else {
        newState.edit = EDIT_MOVE;
      }
      newState.downValue = _.cloneDeep(this.props.value);
    }
    this.setState(newState);
  },

  onMouseMove: function (e) {
    if (!this.state.downAt) return;
    var clone = _.cloneDeep(this.state.downValue);
    var el = this.state.editFrom ? clone.from : clone.to;

    var w = this.innerRect[2];
    var h = this.innerRect[3];
    var c = [ el[1][0] * w, el[1][1] * h ];
    
    var pos = this.pos(e);
    var delta = [
      pos[0] - this.state.downAt[0],
      pos[1] - this.state.downAt[1]
    ];

    switch (this.state.edit) {
      case EDIT_TOPLEFT:
      case EDIT_TOPRIGHT:
      case EDIT_BOTTOMLEFT:
      case EDIT_BOTTOMRIGHT:
        el[0] = Math.min(Math.max(0.1, el[0] * distance(c, pos) / distance(c, this.state.downAt)), 1);
        this.props.onChange(clone);
        break;
      case EDIT_MOVE:
        var center = el[1];
        center[0] = Math.min(Math.max(0, center[0] + delta[0] / w), 1);
        center[1] = Math.min(Math.max(0, center[1] + delta[1] / h), 1);
        this.props.onChange(clone);
        break;
    }
  },

  resetMouse: function () {
    this.setState({
      downAt: null,
      edit: null,
      downValue: null,
      downTime: null,
      downEditFrom: null
    });
  },

  onMouseUp: function (e) {
    if(!this.state.downAt) return;
    var pos = this.pos(e);
    if( this.state.downEditFrom === this.state.editFrom &&
        Date.now() - this.state.downTime < 300 &&
        distance(this.state.downAt, pos) < 10 ) {
      this.setState({
        editFrom: !this.state.editFrom
      });
    }
    this.resetMouse();
  },

  onMouseLeave: function () {
    if (!this.state.downAt) return;
    this.resetMouse();
  },

  onMouseEnter: function () {
  },

  componentWillReceiveProps: function (props) {
    if (this.props.width !== props.width || this.props.height !== props.height)
      this.recomputeImageSizes(this.img, props.width, props.height);
  },

  onImageLoaded: function (img) {
    this.recomputeImageSizes(img, this.props.width, this.props.height);
  },

  recomputeImageSizes: function (img, fullWidth, fullHeight) {
    if (!img) {
      this.imgStyle = this.innerRect = null;
      return;
    }
    var imgWidth = this.img.width;
    var imgHeight = this.img.height;

    var scale = 0.95 * Math.min(fullWidth / imgWidth, fullHeight / imgHeight);
    var translate = [ (fullWidth-scale*imgWidth)/2, (fullHeight-scale*imgHeight)/2 ];
    var translateImage = [translate[0] / scale, translate[1] / scale];
    var imgStyle = scaleTranslateStyle(scale, translateImage);

    var w = Math.round(imgWidth * scale);
    var h = Math.round(imgHeight * scale);

    this.imgStyle = imgStyle;
    this.innerRect = [ Math.round(translate[0]), Math.round(translate[1]), w, h ];
  },

  render: function () {
    var image = this.props.image;
    var fullWidth = this.props.width;
    var fullHeight = this.props.height;
    var progress = this.props.progress;
    var value = this.props.value;
    var editFrom = this.state.editFrom;

    var style = {
      position: "relative",
      overflow: "hidden",
      backgroundColor: "#000",
      width: fullWidth+"px",
      height: fullHeight+"px",
      cursor: cursorForEdit(this.state.edit)
    };

    if (!this.innerRect) {
      return <div style={style} />;
    }

    var w = this.innerRect[2];
    var h = this.innerRect[3];
    var rect = { width: w, height: h };
    var viewport = [0,0,w,h];

    var fromRect = rectRound(rectClamp(rectCrop.apply(null, value.from)(rect, rect), viewport));
    var toRect = rectRound(rectClamp(rectCrop.apply(null, value.to)(rect, rect), viewport));
    var progressRect;
    if (progress) {
      var pRect = rectMix(fromRect, toRect, progress);
      progressRect = <KenBurnsEditorRect edit={false} rect={pRect} viewport={viewport} progress={true} />;
    }

    var from = <KenBurnsEditorRect name="from" edit={editFrom} rect={fromRect} viewport={viewport} center={dot(value.from[1], [w,h])} centerText={centerText(value.from[1])} zoomText={value.from[0].toFixed(2)} />;
    var to = <KenBurnsEditorRect name="to" edit={!editFrom} rect={toRect} viewport={viewport} center={dot(value.to[1], [w,h])} centerText={centerText(value.to[1])} zoomText={value.to[0].toFixed(2)} />;

    var before = !editFrom ? from : to;
    var after = editFrom ? from : to;

    return <div style={style}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onMouseUp={this.onMouseUp}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave} >

      <img src={image} style={this.imgStyle} />
      <svg width={fullWidth} height={fullHeight} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={"translate("+this.innerRect[0]+","+this.innerRect[1]+")"} width={w} height={h}>
          {progressRect}
          {before}
          <KenBurnsEditorOverlay rect={rectGrow(editFrom ? fromRect : toRect, [1,1])} viewport={viewport} />
          {after}
        </g>
      </svg>
    </div>;
  }
});


module.exports = KenBurnsEditor;
