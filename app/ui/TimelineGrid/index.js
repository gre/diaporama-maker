var React = require("react/addons");
var PureRenderMixin = React.addons.PureRenderMixin;


var labellers = [
  function () {
    return "";
  },
  function (t) {
    return (t / 1000) + "";
  },
  function (t) {
    return (t / 1000) + "s";
  }
];

var labelStyles = [
  { alignmentBaseline: "text-after-edge", textAnchor: "middle", fill: "#000", fontSize: 8 },
  { alignmentBaseline: "text-after-edge", textAnchor: "middle", fill: "#000", fontSize: 8 },
  { alignmentBaseline: "text-after-edge", textAnchor: "middle", fill: "#000", fontSize: 10 }
];

var lineStyles = [
  { stroke: "rgba(0,0,0,0.1)", strokeWidth: 1 },
  { stroke: "rgba(0,0,0,0.5)", strokeWidth: 1 },
  { stroke: "rgba(0,0,0,1.0)", strokeWidth: 1 }
];

var tickHeights = [
  4,
  4,
  6
];

var all = [ 100, 500, 1000, 5000, 10000, 20000, 60000 ];
var timeScaleThreshold = 20;
function granularitiesForTimeScale (timeScale) {
  var g = 0;
  while (g < all.length && all[++g]*timeScale < timeScaleThreshold);
  g --;
  return all.slice(g, g+3);
}


var TimelineGrid = React.createClass({
  mixins: [PureRenderMixin],

  render: function () {
    var timeScale = this.props.timeScale;
    var width = this.props.width;
    var height = this.props.height;
    var style = {
      position: "absolute",
      top: 0,
      left: 0
    };
    var duration = width / timeScale;
    var granularities = granularitiesForTimeScale(timeScale);

    var minGran = granularities[0];
    
    var labels = [];
    var lines = [];

    for (var t = 0; t < duration; t += minGran) {
      var g = 0;
      while (g < granularities.length && t % granularities[++g] === 0);
      g --;

      var label = labellers[g](t);

      var x = Math.round(t * timeScale);
      var y = 16-tickHeights[g];

      if (label) {
        labels.push(
          <text key={"t"+t} style={labelStyles[g]} x={x} y={y}>{label}</text>
        );
      }
      lines.push(
        <line key={"l"+t} style={lineStyles[g]} x1={x} y1={y} x2={x} y2={height} />
      );
    }
    return <svg style={style} width={width} height={height}>
      <g>{lines}</g>
      <g>{labels}</g>
    </svg>;
  }
});


module.exports = TimelineGrid;
