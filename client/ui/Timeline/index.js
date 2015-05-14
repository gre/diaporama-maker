import React from "react";
import _ from "lodash";
import boundToStyle from "../../core/boundToStyle";
import PromiseMixin from "../../mixins/PromiseMixin";
import TimelineGrid from "../TimelineGrid";
import TimelineElement from "../TimelineElement";
import TimelineZoomControls from "../TimelineZoomControls";
import TimelineTransition from "../TimelineTransition";
import TimelineSelection from "./TimelineSelection";
import Diaporama from "../../models/Diaporama";
import Icon from "../Icon";
import TimelineCursor from "./TimelineCursor";
import {DragItems, SCROLL_BAR_W} from "../../constants";
import {DragDropMixin} from 'react-dnd';

function scrollSpeed (x, xtarget, normDist, speed) {
  const dist = Math.abs(x - xtarget) / normDist;
  return speed * Math.exp(-(dist * dist));
}

const trackDragOverX = function (context) {
  return {
    leave (component) {
      component._dragOverX = null;
      component.setState({ hoverPlace: null });
    },
    over (component) {
      const initial = context.getInitialOffsetFromClient();
      const delta = context.getCurrentOffsetDelta();
      component._dragOverX = initial.x + delta.x;
      const time = component.timeForClientX(initial.x + delta.x);
      const place = Diaporama.lookupBetweenImagePlace(component.props.diaporama, time);
      if (!_.isEqual(component.state.place, place))
        component.setState({ hoverPlace: place });
    },
    acceptDrop (component) {
      component._dragOverX = null;
      component.setState({ hoverPlace: null });
    }
  };
};


const Timeline = React.createClass({

  mixins: [ PromiseMixin, DragDropMixin ],

  propTypes: {
    diaporama: React.PropTypes.object.isRequired,
    alterDiaporama: React.PropTypes.func.isRequired,
    selectedItemPointer: React.PropTypes.object
  },

  statics: {
    configureDragDrop (register, context) {
      const track = trackDragOverX(context);
      register(DragItems.SLIDE, {
        dropTarget: {
          enter: track.enter,
          leave: track.leave,
          over: track.over,

          getDropEffect () {
            return "move";
          },

          acceptDrop (component, item) {
            track.acceptDrop(component);
            const initial = context.getInitialOffsetFromClient();
            const delta = context.getCurrentOffsetDelta();
            const time = component.timeForClientX(initial.x + delta.x);
            const place = Diaporama.lookupBetweenImagePlace(component.props.diaporama, time);
            component.props.alterDiaporama("moveItem", item, place);
          }
        }
      });
      register(DragItems.LIBRARY_ITEMS, {
        dropTarget: {
          enter: track.enter,
          leave: track.leave,
          over: track.over,

          getDropEffect () {
            return "copy";
          },

          acceptDrop (component, items) {
            const all = items.all;
            track.acceptDrop(component);
            const initial = context.getInitialOffsetFromClient();
            const delta = context.getCurrentOffsetDelta();
            const time = component.timeForClientX(initial.x + delta.x);
            const place = Diaporama.lookupBetweenImagePlace(component.props.diaporama, time);
            component.props.alterDiaporama("bootstrapItems", all, place);
          }
        }
      });
    }
  },

  // Exposed Methods

  collidesPosition (p) {
    const node = this.getDOMNode();
    const rect = node.getBoundingClientRect();
    if (p[1] < rect.top || p[1] > rect.bottom) {
      return null;
    }
    return {
      time: this.eventPositionToTime(p)
    };
  },

  //////

  getInitialState () {
    return {
      hoverPlace: null,
      mouseDown: null,
      timeScale: 0.1 // pixels per milliseconds
    };
  },

  setTimeScale (s) {
    this.setState({
      timeScale: s
    });
  },

  getEventPosition (e) {
    const bounds = this.getDOMNode().getBoundingClientRect();
    const node = this.refs.scrollcontainer.getDOMNode();
    const scrollLeft = node.scrollLeft;
    const x = e.clientX - bounds.left + scrollLeft;
    const y = e.clientY - bounds.top;
    return [ x, y ];
  },

  getEventStats (e) {
    return {
      at: this.getEventPosition(e),
      time: Date.now()
    };
  },

  eventPositionToTime (p) {
    return p[0] / this.state.timeScale;
  },

  timeForClientX (x) {
    const node = this.refs.scrollcontainer.getDOMNode();
    const scrollLeft = node.scrollLeft;
    return (x + scrollLeft) / this.state.timeScale;
  },

  onMouseMove (e) {
    const cb = this.props.onHoverMove;
    if (!cb) return;
    const mouseMove = this.getEventStats(e);
    cb(this.eventPositionToTime(mouseMove.at));
  },

  onMouseEnter () {
    this.props.onHoverEnter();
  },

  onMouseLeave () {
    this.props.onHoverLeave();
  },

  onClick (e) {
    // TODO: the 'lookup' can be pass in instead of re-determined
    const pos = this.getEventPosition(e);
    const lookup = Diaporama.lookupSegment(this.props.diaporama, this.eventPositionToTime(pos));
    if (lookup) {
      if (_.isEqual(lookup, this.props.selectedItemPointer))
        this.props.onSelect(null);
      else
        this.props.onSelect(lookup);
    }
  },

  componentWillMount () {
    this._dragOverX = null;
  },

  componentWillReceiveProps (newProps) {
    const props = this.props;
    if (newProps.selectedItemPointer &&
        (!_.isEqual(props.selectedItemPointer, newProps.selectedItemPointer) ||
         this.props.diaporama !== newProps.diaporama)) {
      const node = this.refs.scrollcontainer.getDOMNode();
      const timeScale = this.state.timeScale;
      const scrollLeft = node.scrollLeft;
      const width = node.clientWidth;
      const scrollDuration = width / timeScale;
      const timeFrom = scrollLeft / timeScale;
      const timeTo = timeFrom + scrollDuration;
      const interval = Diaporama.timelineTimeIntervalForItemPointer(newProps.diaporama, newProps.selectedItemPointer);
      if (interval) {
        // Fix the scrolling by "window of width"
        if (interval.end < timeFrom) {
          node.scrollLeft = scrollLeft - timeScale * scrollDuration * Math.ceil((timeFrom - interval.end) / scrollDuration);
        }
        else if (timeTo < interval.start) {
          node.scrollLeft = scrollLeft + timeScale * scrollDuration * Math.ceil((interval.start - timeTo) / scrollDuration);
        }
      }
    }
  },

  update (t, dt) {
    const x = this._dragOverX;
    if (x !== null) {
      // TODO FIXME: this is only good for Library -> Timeline d&d, for slide d&d, use relative offset only
      const node = this.refs.scrollcontainer.getDOMNode();
      const w = node.clientWidth;
      const border = 10;
      const normDist = w / 4;
      const speed = 2;
      const dx = - scrollSpeed(x, border, normDist, speed) + scrollSpeed(x, w-border, normDist, speed);
      node.scrollLeft += dx * dt;
    }
  },

  render () {
    const diaporama = this.props.diaporama;
    const timeline = diaporama.timeline;
    const bound = this.props.bound;
    const time = this.props.time;
    const selectedItemPointer = this.props.selectedItemPointer;
    const hoverPlace = this.state.hoverPlace;
    const timeScale = this.state.timeScale;

    const gridTop = 4;
    const gridHeight = bound.height - gridTop - SCROLL_BAR_W;
    const lineTop = 18;
    const lineHeight = gridHeight - lineTop;

    const style = _.extend({
      background: "#fcfcfc"
    }, boundToStyle(bound));

    const zoomStyle = {
      background: style.background
    };

    const zoomControlsStyle = {
      position: "absolute",
      right: "4px",
      top: "0px",
      zIndex: 8
    };

    const lineStyle = {
      background: "#333",
      position: "relative",
      top: lineTop+"px",
      height: lineHeight+"px",
      zIndex: 2
    };

    const lineContainerStyle = {
      position: "absolute",
      zIndex: 1,
      top: gridTop+"px",
      left: "0px",
      width: bound.width+"px",
      height: (bound.height-gridTop)+"px",
      overflow: "auto"
    };

    let selectedOverlay;

    const lineContent = [];
    let x = 0;
    let prevTransitionWidth = 0;
    for (let i=0; i<timeline.length; ++i) {
      const item = timeline[i];
      const next = timeline[i+1];
      const spaceAfter = hoverPlace && (
        hoverPlace.after && item.id === hoverPlace.id ||
        hoverPlace.before && next && next.id === hoverPlace.id
      );
      const transitionw = item.transitionNext && item.transitionNext.duration ? Math.round(timeScale * item.transitionNext.duration) : 0;

      const onlyImageW = Math.round(timeScale * item.duration);
      const thumbw = transitionw/2 + prevTransitionWidth/2 + onlyImageW;

      const currentSelected = selectedItemPointer && selectedItemPointer.id === item.id;

      if (currentSelected) {
        const isTransition = selectedItemPointer.transition;
        const sx = isTransition ? x + thumbw - transitionw / 2 : x + prevTransitionWidth/2;
        const sw = isTransition ? transitionw : onlyImageW;

        selectedOverlay = <TimelineSelection
          key="tl-selection"
          itemPointer={selectedItemPointer}
          item={item}
          x={sx}
          width={sw}
          height={lineHeight}
          onClick={this.onClick}
          timeScale={timeScale}
          alterDiaporama={this.props.alterDiaporama}
        />;
      }

      lineContent.push(
        <TimelineElement
          selected={currentSelected && !selectedItemPointer.transition}
          x={x}
          width={thumbw}
          height={lineHeight}
          item={item}
          key={item.id}
          onClick={this.onClick}
        />
      );

      if (item.transitionNext) {
        lineContent.push(
          <TimelineTransition
            key={item.id+"@t"}
            selected={currentSelected && selectedItemPointer.transition}
            xcenter={x + thumbw}
            width={transitionw}
            height={lineHeight}
            transition={item.transitionNext}
            onClick={this.onClick}
          />
        );
      }
      else {
        const xcenter = x + thumbw;
        const editSize = 50;
        const editIconStyle = boundToStyle({
          x: xcenter-editSize/2,
          y: (lineHeight-editSize)/2,
          width: editSize,
          height: editSize
        });
        editIconStyle.zIndex = 40;

        lineContent.push(
          <Icon
            key={item.id+"@t"}
            style={editIconStyle}
            title="Add a transition"
            name="magic"
            color="#fff"
            size={editSize}
            onClick={this.props.alterDiaporama.bind(null, "bootstrapTransition", item.id)}
          />
        );
      }

      prevTransitionWidth = transitionw;
      x += thumbw;

      if (spaceAfter) {
        const pad = 2;
        const top = 6;
        const cursorStyle = {
          background: "#fc0",
          position: "absolute",
          top: "-"+top+"px",
          left: Math.round(x-pad)+"px",
          height: (lineHeight+top)+"px",
          width: (2*pad)+"px",
          zIndex: 52
        };
        const cursorIconStyle = {
          position: "absolute",
          top: "-14px",
          left: (-10+pad)+"px",
          color: "#fc0",
          fontSize: 20
        };
        lineContent.push(
          <div key="cursor" style={cursorStyle}>
            <Icon style={cursorIconStyle} name="chevron-down" />
          </div>
        );
      }
    }
    x += prevTransitionWidth/2;

    if (selectedOverlay) {
      lineContent.push(selectedOverlay);
    }

    const gridWidth = Math.max(x, bound.width);

    lineStyle.width = gridWidth+"px";

    return <div style={style}
      {...this.dropTargetFor(DragItems.LIBRARY_ITEMS, DragItems.SLIDE)}
      onMouseMove={this.onMouseMove}
      onMouseEnter={this.onMouseEnter}
      onMouseLeave={this.onMouseLeave}>
      <div style={zoomControlsStyle}>
        <TimelineZoomControls
          value={timeScale}
          onChange={this.setTimeScale}
          style={zoomStyle} />
      </div>
      <div style={lineContainerStyle} ref="scrollcontainer">
        <div style={lineStyle}>{lineContent}</div>
        <TimelineGrid timeScale={timeScale} width={gridWidth} height={gridHeight} />
        <TimelineCursor time={time} timeScale={timeScale} headerHeight={lineTop} />
      </div>
    </div>;
  }
});

module.exports = Timeline;
