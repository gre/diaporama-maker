import React from "react";
import _ from "lodash";
import {DragDropMixin} from 'react-dnd';
import {DragItems} from "../../constants";
import Diaporama from "../../models/Diaporama";
import boundToStyle from "../../core/boundToStyle";
import toProjectUrl from "../../core/toProjectUrl";
import Library from "../Library";
import Icon from "../Icon";
import TransitionCustomizer from "../TransitionCustomizer";
import ImageCustomizer from "../ImageCustomizer";
import GenerateScreen from "../GenerateScreen";
import ErrorScreen from "../ErrorScreen";
import AboutScreen from "../AboutScreen";
import Config from "../Config";
import TimelineElementInfo from "../TimelineElementInfo";

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
      var diaporama = this.props.diaporama;
      return <Library
        width={innerWidth}
        height={innerHeight}
        usedImages={_.pluck(diaporama.timeline, "image")}
        alterDiaporama={this.props.alterDiaporama}
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
      var id = this.props.selectedItemPointer.id;
      var diaporama = this.props.diaporama;
      var element = Diaporama.timelineForId(diaporama, id);
      if (!element) return <div>Slide Removed.</div>;
      return <div>
        <TimelineElementInfo value={element} />
        <ImageCustomizer
          value={element}
          onChange={this.props.alterSelection.bind(null, "setItem")}
          width={innerWidth}
          onRemove={this.props.alterSelection.bind(null, "removeItem")}
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
      var id = this.props.selectedItemPointer.id;
      var diaporama = this.props.diaporama;
      var transitionInfos = Diaporama.timelineTransitionForId(diaporama, id);
      if (!transitionInfos || !transitionInfos.transitionNext) return <div>Transition Removed.</div>;
      return <TransitionCustomizer
        value={transitionInfos.transitionNext}
        onChange={this.props.alterSelection.bind(null, "setItem")}
        width={innerWidth}
        images={[ transitionInfos.from.image, transitionInfos.to.image ].map(toProjectUrl)}
        animated={false}
        onRemove={this.props.alterSelection.bind(null, "removeItem")}
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
