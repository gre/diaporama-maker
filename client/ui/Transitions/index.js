import React from "react";
import _ from "lodash";
import VignetteGrid from "glsl-transition-vignette-grid";
import Vignette from "glsl-transition-vignette";
import Icon from "../Icon";
import VignetteInnerInfos from "./VignetteInnerInfos";

const vignetteWidthBase = 256;
const vignetteHeightBase = 200;

const cols = 3;
const rows = 2;
const perPage = cols * rows;

function queryMatch (q, text) {
  q = q.toLowerCase();
  text = text.toLowerCase();
  return _.chain(q.split(" "))
    .map(w => w.trim())
    .filter()
    .every(w => text.indexOf(w) !== -1)
    .value();
}

const Transitions = React.createClass({

  getInitialState: function () {
    return {
      page: 0,
      q: ""
    };
  },

  nextPage: function (nbPages) {
    const next = Math.min(this.state.page + 1, nbPages-1);
    if (this.state.page !== next) {
      this.setState({ page: next });
    }
  },

  prevPage: function () {
    const prev = Math.max(0, this.state.page - 1);
    if (this.state.page !== prev) {
      this.setState({ page: prev });
    }
  },

  onTypeahead: function (e) {
    this.setState({
      q: e.target.value,
      page: 0
    });
  },

  render: function () {
    const {
      onTransitionSelected,
      width,
      height,
      images,
      transitionCollection
    } = this.props;
    const {
      page,
      q
    } = this.state;

    const contentHeight = height - 30;

    const vignetteWidth = Math.min(Math.floor((width-2) / cols - 14), vignetteWidthBase);
    const vignetteHeight = Math.floor(vignetteHeightBase * vignetteWidth/vignetteWidthBase);

    const buttonSize = Math.floor(vignetteHeight / 2);

    const collection = _.filter(transitionCollection, function (t) {
      return queryMatch(q, t.owner) || queryMatch(q, t.name);
    });
    const nbPages = Math.ceil(collection.length / perPage);
    const pageCollection = collection.slice(page * perPage, (page+1) * perPage);

    const navStyle = {
      position: "absolute",
      top: "0px",
      right: "10px",
      padding: "4px",
      fontSize: "1.2em"
    };

    const typeaheadStyle = {
      position: "absolute",
      left: "180px",
      top: "4px",
      fontSize: "1.2em",
      padding: "2px"
    };

    const headerStyle = {
      position: "relative"
    };

    const bodyStyle = {
      overflow: "auto",
      padding: "1px 5px",
      height: contentHeight+"px"
    };

    const vignetteButtonStyle = {
      position: "absolute",
      left: ((vignetteWidth-buttonSize)/2)+"px",
      top: ((vignetteHeight-buttonSize)/2)+"px"
    };

    const renderVignette = (props, transition) => {
      const onClick = () => onTransitionSelected(props.name);
      return <Vignette {...props}>
        <VignetteInnerInfos transition={transition} />
        <Icon
          name="check-square"
          color="#fff"
          size={buttonSize}
          onClick={onClick}
          style={vignetteButtonStyle} />
      </Vignette>;
    };

    const items = <VignetteGrid
      transitions={pageCollection}
      images={images}
      vignetteWidth={vignetteWidth}
      vignetteHeight={vignetteHeight}
      vignetteMargin={[ 4, 6 ]}
      renderVignette={renderVignette}
    />;

    return <div style={{ width: width+"px", height: height+"px" }}>
      <header style={headerStyle}>
        <h2>Transitions</h2>
        <input style={typeaheadStyle} type="search" placeholder="Search..." value={q} onChange={this.onTypeahead} />
        <nav style={navStyle}>
          <Icon name="caret-square-o-left" onClick={this.prevPage.bind(this, nbPages)} />
          &nbsp;
          {page+1} / {nbPages}
          &nbsp;
          <Icon name="caret-square-o-right" onClick={this.nextPage.bind(this, nbPages)} />
        </nav>
      </header>
      <div style={bodyStyle}>
        {items}
      </div>
    </div>;
  }

});

module.exports = Transitions;
