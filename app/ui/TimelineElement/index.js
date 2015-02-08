var React = require("react");
var translateStyle = require("../../core/translateStyle");
var toProjectUrl = require("../../core/toProjectUrl");
var Thumbnail = require("../Thumbnail");
var Icon = require("../Icon");

var TimelineElement = React.createClass({

  onDurationChange: function (e) {
    this.props.onDurationChange(parseInt(e.target.value));
  },

  render: function () {
    var x = this.props.x;
    var width = this.props.width;
    var height = this.props.height;
    var item = this.props.item;
    //  <Icon name="crop" color="#FFF" onClick={this.props.onCrop} />
    return <div className="timeline-element" style={translateStyle(x, 0)}>
      <Thumbnail image={toProjectUrl(item.image)} width={width} height={height} />
      <div className="actions">
        <Icon name="arrow-circle-o-left" color="#fff" onClick={this.props.onMoveLeft} />
        &nbsp;
        <Icon name="remove" color="#F00" onClick={this.props.onRemove} />
        &nbsp;
        <Icon name="arrow-circle-o-right" color="#fff" onClick={this.props.onMoveRight} />
      </div>
      <div className="sub-actions">
        <Icon name="crop" color="#fff" onClick={this.props.onCrop} />
        <Icon name="line-chart" color="#fff" onClick={this.props.onEasing} />
        <div>
          <input type="number" min={500} step={100} max={10000} value={item.duration} onChange={this.onDurationChange} />
        </div>
      </div>
    </div>;
  }
});

module.exports = TimelineElement;
