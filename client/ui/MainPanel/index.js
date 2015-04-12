import React from "react";
import _ from "lodash";
import {DragDropMixin} from 'react-dnd';
import {DragItems} from "../../constants";
import Diaporama from "../../models/Diaporama";
import Transitions from "../../models/transitions";
import boundToStyle from "../../core/boundToStyle";
import Library from "../Library";
import Icon from "../Icon";
import TransitionCustomizer from "../TransitionCustomizer";
import ImageCustomizer from "../ImageCustomizer";
import GenerateScreen from "../GenerateScreen";
import ErrorScreen from "../ErrorScreen";
import AboutScreen from "../AboutScreen";
import Config from "../Config";
import TimelineElementInfo from "../TimelineElementInfo";

function step (a, b, x) {
  return Math.max(0, Math.min((x-a) / (b-a), 1));
}

var panels = {

  about: {
    accessible: () => true,
    icon: "info-circle",
    iconStyle: { position: "absolute", bottom: 5 },
    title: "About",
    render () {
      return <AboutScreen onDone={this.props.onNav.bind(null, "library")} />;
    }
  },

  error: {
    accessible: () => false,
    icon: "bug",
    title: "Error",
    render () {
      return <ErrorScreen error={this.props.error} />;
    }
  },

  config: {
    accessible: () => true,
    icon: "cogs",
    title: "Configuration",
    render (innerWidth, innerHeight) {
      const {
        diaporama,
        alterDiaporama
      } = this.props;
      return <Config
        width={innerWidth}
        height={innerHeight}
        diaporama={diaporama}
        alterDiaporama={alterDiaporama}
      />;
    }
  },

  library: {
    accessible: () => true,
    icon: "folder-open",
    title: "Library",
    render: function (innerWidth, innerHeight) {
      const {
        diaporama,
        alterDiaporama
      } = this.props;
      return <Library
        width={innerWidth}
        height={innerHeight}
        usedImages={_.pluck(diaporama.timeline, "image")}
        alterDiaporama={alterDiaporama}
      />;
    }
  },

  generate: {
    accessible: () => true,
    icon: "download",
    title: "Save / Generate",
    render: function (innerWidth, innerHeight) {
      var diaporama = this.props.diaporama;
      return <GenerateScreen
        width={innerWidth}
        height={innerHeight}
        diaporama={diaporama}
      />;
    }
  },

  editImage: {
    accessible(props) {
      const { selectedItemPointer } = props;
      return selectedItemPointer && !selectedItemPointer.transition;
    },
    icon: "picture-o",
    title: "Edit Image",
    render (innerWidth) {
      const {
        selectedItemPointer,
        diaporama,
        alterSelection,
        time
      } = this.props;
      const element = Diaporama.timelineForId(diaporama, selectedItemPointer.id);
      const interval = Diaporama.timelineTimeIntervalForItemPointer(diaporama, selectedItemPointer);
      const progress = step(interval.start, interval.end, time);
      if (!element) return <div>Slide Removed.</div>;
      return <div>
        <TimelineElementInfo value={element} />
        <ImageCustomizer
          value={element}
          onChange={alterSelection.bind(null, "setItem")}
          width={innerWidth}
          onRemove={alterSelection.bind(null, "removeItem")}
          progress={progress}
        />
      </div>;
    }
  },

  editTransition: {
    accessible(props) {
      const { selectedItemPointer } = props;
      return selectedItemPointer && selectedItemPointer.transition;
    },
    icon: "magic",
    title: "Edit Transition",
    render (innerWidth) {
      const {
        selectedItemPointer,
        diaporama,
        time,
        alterSelection
      } = this.props;
      const transitionInfos = Diaporama.timelineTransitionForId(diaporama, selectedItemPointer.id);
      const interval = Diaporama.timelineTimeIntervalForItemPointer(diaporama, selectedItemPointer);
      const progress = step(interval.start, interval.end, time);
      if (!transitionInfos || !transitionInfos.transitionNext) return <div>Transition Removed.</div>;
      return <TransitionCustomizer
        value={transitionInfos.transitionNext}
        onChange={alterSelection.bind(null, "setItem")}
        width={innerWidth}
        images={[ transitionInfos.from.image, transitionInfos.to.image ].map(DiaporamaMakerAPI.toProjectUrl)}
        progress={progress}
        onRemove={alterSelection.bind(null, "removeItem")}
        transitionCollection={Transitions.collectionForDiaporama(diaporama)}
      />;
    }
  }

};

var MainPanel = React.createClass({

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

  render () {
    const props = this.props;
    const {
      bound,
      mode,
      onNav
    } = props;

    var navWidth = 40;
    var innerWidth = bound.width - navWidth;
    var innerHeight = bound.height;

    var panel = panels[mode];
    var panelDom = panel && panel.render && panel.render.call(this, innerWidth, innerHeight);

    var style = _.extend({
      borderTop: "1px solid #ccc",
      borderBottom: "1px solid #eee"
    }, boundToStyle(bound));

    var bodyStyle = _.extend({
      overflow: "auto"
    }, boundToStyle({ x: navWidth, y: 0, width: innerWidth, height: innerHeight }));

    var navStyle = _.extend({
      padding: "8px",
      fontSize: "24px"
    }, boundToStyle({ x: 0, y: 0, width: navWidth, height: bound.height }));

    var navs = _.map(panels, function (panel, panelMode) {
      var selected = panelMode === mode;
      var onClick = panel.accessible(props) ? onNav.bind(null, panelMode) : undefined;
      if (!selected && !onClick) return undefined;
      const iconStyle = panel.iconStyle || {};
      return <Icon
        style={iconStyle}
        title={panel.title}
        key={panelMode}
        name={panel.icon}
        color={selected ? "#000" : "#999"}
        colorHover={selected ? "#000" : "#f90"}
        onClick={onClick}
      />;
    }, this);

    return <div style={style}>
      <nav style={navStyle}>
        {navs}
      </nav>
      <div
      {...this.dropTargetFor(DragItems.SLIDE)}
      style={bodyStyle}>
      {panelDom}
      </div>
    </div>;
  }
});

module.exports = MainPanel;
