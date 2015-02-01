var React = require("react");
var DiaporamaEngine = require("diaporama");
var GlslTransitions = require("glsl-transitions");
var boundToStyle = require("../../core/boundToStyle");

var Diaporama = React.createClass({
  diaporamaHasChanged: function (props) {
    var container = this.refs.container.getDOMNode();

    // FIXME, because DiaporamaEngine doesn't handle yet any reload..
    if (this.engine) {
      for (var k in this.engine) {
        this.engine[k] = null;
      }
      container.innerHTML = "";
    }

    if (props.diaporama) {
      this.engine = new DiaporamaEngine({
        container: container,
        data: props.diaporama,
        GlslTransitions: GlslTransitions
      });
      this.engine.start();
    }
  },
  render: function () {
    var style = boundToStyle({ x: 0, y: 0, width: this.props.width, height: this.props.height });
    return <div ref="container" style={style} />;
  },
  componentDidMount: function () {
    this.diaporamaHasChanged(this.props);
  },
  componentWillReceiveProps: function (props) {
    if (this.props.diaporama !== props.diaporama) {
      this.diaporamaHasChanged(props);
    }
  }
});

module.exports = Diaporama;
