var React = require("react");
var Q = require("q");
var _ = require("lodash");
var GlslTransitions = require("glsl-transitions");
var GlslTransition = require("glsl-transition");
var Vignette = require("glsl.io-client/src/ui/Vignette");
var Icon = require("../Icon");

function filterWithoutCustomSampler2D (transitions, mapFilter) {
  return transitions.filter(function (t) {
    for (var k in t.uniforms)
    if (typeof t.uniforms[k] === "string")
    return false;
  return true;
  }).map(mapFilter).filter(function (t) { return !!t; });
}

// Test and filter transitions
var canvas = document.createElement("canvas");
var T = GlslTransition(canvas);
var filteredGlslTransitions = filterWithoutCustomSampler2D(GlslTransitions.sort(function (a, b) {
  return b.stars - a.stars;
}), function (t) {
  try {
    var compiled = T(t.glsl, t.uniforms);
    compiled.destroy();
    return t;
  }
  catch (e) {
    console.log("transition '"+ t.name +"' failed to compile:", e.stack);
  }
});
T = null;
canvas = null;
//////////////

var d1 = Q.defer();
var d2 = Q.defer();
var fromImage = new Image();
var toImage = new Image();
fromImage.onload = d1.resolve; fromImage.onerror = d1.reject;
toImage.onload = d2.resolve; toImage.onerror = d2.reject;
fromImage.src = "/static/images/1.jpg";
toImage.src = "/static/images/2.jpg";
var ready = Q.all([ d1.promise, d2.promise ]);

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
    var width = this.props.width;
    var height = this.props.height;
    var page = this.state.page;
    var q = this.state.q;

    var contentHeight = height - 30;

    var vignetteWidth = Math.min(Math.floor((width-2) / cols - 14), vignetteWidthBase);
    var vignetteHeight = Math.floor(vignetteHeightBase * vignetteWidth/vignetteWidthBase);

    var coll = _.filter(filteredGlslTransitions, function (t) {
        return queryMatch(q, t.owner) || queryMatch(q, t.name);
      });
    var nbPages = Math.ceil(coll.length / perPage);
    coll = coll.slice(page * perPage, (page+1) * perPage);

    var items = _.map(coll, function (t) {
      return <Vignette
        key={t.name}
        glsl={t.glsl}
        uniforms={t.uniforms}
        images={[ fromImage, toImage ]}
        width={vignetteWidth}
        height={vignetteHeight}>
        <span className="tname">{t.name}</span>
        <span className="tauthor">by <em>{t.owner}</em></span>
      </Vignette>;
    });

    return <div className="transitions" style={{ width: width+"px", height: height+"px" }}>
      <header>
        <h2>Transitions</h2>
        <input className="typeahead" type="search" placeholder="Search..." value={q} onChange={this.onTypeahead} />
        <nav>
          <Icon name="caret-square-o-left" onClick={this.prevPage.bind(this, nbPages)} />
          &nbsp;
          {page+1} / {nbPages}
          &nbsp;
          <Icon name="caret-square-o-right" onClick={this.nextPage.bind(this, nbPages)} />
        </nav>
      </header>
      <div className="body" style={{ height: contentHeight+"px" }}>
        {items}
      </div>
    </div>;
  }

});

Transitions.ready = ready;

module.exports = Transitions;
