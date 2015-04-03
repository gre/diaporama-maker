var React = require("react");
var _ = require("lodash");
var VignetteGrid = require("glsl-transition-vignette-grid");
var Vignette = require("glsl-transition-vignette");
var Icon = require("../Icon");
var transitions = require("../../models/transitions");

var vignetteWidthBase = 256;
var vignetteHeightBase = 200;

var cols = 3;
var rows = 2;
var perPage = cols * rows;

function queryMatch (q, text) {
  q = q.toLowerCase();
  text = text.toLowerCase();
  return _.chain(q.split(" "))
    .map(function (w) {
      return w.trim();
    })
    .filter()
    .every(function (w) {
      return text.indexOf(w) !== -1;
    })
    .value();
}

var Transitions = React.createClass({

  getInitialState: function () {
    return {
      page: 0,
      q: ""
    };
  },

  nextPage: function (nbPages) {
    var next = Math.min(this.state.page + 1, nbPages-1);
    if (this.state.page !== next) {
      this.setState({ page: next });
    }
  },

  prevPage: function () {
    var prev = Math.max(0, this.state.page - 1);
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
      images
    } = this.props;
    const {
      page,
      q
    } = this.state;

    var contentHeight = height - 30;

    var vignetteWidth = Math.min(Math.floor((width-2) / cols - 14), vignetteWidthBase);
    var vignetteHeight = Math.floor(vignetteHeightBase * vignetteWidth/vignetteWidthBase);

    var buttonSize = Math.floor(vignetteHeight / 2);

    var coll = _.filter(transitions.collection, function (t) {
      return queryMatch(q, t.owner) || queryMatch(q, t.name);
    });
    var nbPages = Math.ceil(coll.length / perPage);
    coll = coll.slice(page * perPage, (page+1) * perPage);

    var navStyle = {
      position: "absolute",
      top: "0px",
      right: "10px",
      padding: "4px",
      fontSize: "1.2em"
    };

    var typeaheadStyle = {
      position: "absolute",
      left: "180px",
      top: "4px",
      fontSize: "1.2em",
      padding: "2px"
    };

    var headerStyle = {
      position: "relative"
    };

    var bodyStyle = {
      overflow: "auto",
      padding: "1px 5px",
      height: contentHeight+"px"
    };

    const renderVignette = (props) => {
      const onClick = () => onTransitionSelected(props.name);
      return <Vignette
        {...props}>
        <a href={props.id ? ("https://glsl.io/transition/"+props.id) : undefined} target="_blank" className="tname">{props.name}</a>
        <div className="actions">
          <Icon name="check-square" color="#fff" size={buttonSize} onClick={onClick} style={{ position: "absolute", left: ((vignetteWidth-buttonSize)/2)+"px", top: ((vignetteHeight-buttonSize)/2)+"px" }} />
        </div>
        <a href={"https://glsl.io/user/"+props.owner} target="_blank" className="tauthor">by <em>{props.owner}</em></a>
      </Vignette>;
    };

    var items = <VignetteGrid
      transitions={coll}
      images={images}
      vignetteWidth={vignetteWidth}
      vignetteHeight={vignetteHeight}
      renderVignette={renderVignette}
    />;

    /*
        var self = this;
    var items = _.map(coll, function (t) {
      function onClick () {
        self.props.onTransitionSelected(t.name);
      }
      return <Vignette
        key={t.name}
        glsl={t.glsl}
        uniforms={t.uniforms}
        images={[ fromImage, toImage ]}
        width={vignetteWidth}
        height={vignetteHeight}>
        <a href={t.id ? ("https://glsl.io/transition/"+t.id) : undefined} target="_blank" className="tname">{t.name}</a>
        <div className="actions">
          <Icon name="check-square" color="#fff" size={buttonSize} onClick={onClick} style={{ position: "absolute", left: ((vignetteWidth-buttonSize)/2)+"px", top: ((vignetteHeight-buttonSize)/2)+"px" }} />
        </div>
        <a href={"https://glsl.io/user/"+t.owner} target="_blank" className="tauthor">by <em>{t.owner}</em></a>
      </Vignette>;
    });
    */

    return <div className="transitions" style={{ width: width+"px", height: height+"px" }}>
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
