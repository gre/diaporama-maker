var React = require("react");
var _ = require("lodash");
var images = require("../../resource/images");
var GlslTransitions = require("glsl-transitions");

var BooleanInput = require("../BooleanInput");
var DurationInput = require("../DurationInput");
var TransitionCustomizer = require("../TransitionCustomizer");
var KenBurnsEditor = require("../KenBurnsEditor");
var DiaporamaElement = require("../DiaporamaElement");
var Icon = require("../Icon");

var Bootstrap = React.createClass({
  componentDidMount: function () {
    // not very performant. we might improve
    /*
    var self = this;
    raf(function loop () {
      if (self.isMounted()) {
        raf(loop);
        var p = Date.now() / self.state.imageSkeleton.duration;
        p -= Math.floor(p);
        self.setState({ progress: p });
      }
    });
    */
  },
  animate: function () {
  },
  getInitialState: function () {
    return {
      pickAllImages: false,
      shuffle: false,
      withKenburns: false,
      withTransition: false,
      withHTML: true,
      imageSkeleton: {
        duration: 2000,
        kenburns: {
          from: [1, [0.5, 0.5]],
          to: [0.75, [0.5, 0.5]]
        }
      },
      transitionSkeleton: {
        duration: 1000
      },
      progress: 0
    };
  },
  computeTimelineSkeleton: function () {
    var skeleton = _.clone(this.state.imageSkeleton);
    if (!this.state.withKenburns) delete skeleton.kenburns;
    if (this.state.withTransition) {
      skeleton.transitionNext = _.cloneDeep(this.state.transitionSkeleton);
    }
    return skeleton;
  },
  generateDiaporamaExample: function () {
    var skeleton = this.computeTimelineSkeleton();
    var timeline = (!this.state.pickAllImages ? [] : [ "/static/images/1.jpg", "/static/images/2.jpg" ]).map(function (imageSrc) {
      return _.defaults({ image: imageSrc }, skeleton);
    });
    return { timeline: timeline };
  },
  submit: function (e) {
    e.preventDefault();
    var data = {
      pickAllImages: this.state.pickAllImages,
      shuffle: this.state.shuffle,
      timelineSkeleton: this.computeTimelineSkeleton(),
      withHTML: this.state.withHTML
    };
    this.props.onSubmit(data);
  },
  onChangePickAllImages: function (value) {
    this.setState({
      pickAllImages: value
    });
  },
  onChangeWithHTML: function (value) {
    this.setState({
      withHTML: value
    });
  },
  onChangeWithKenburns: function (value) {
    this.setState({
      withKenburns: value
    });
  },
  onChangeKenburns: function (value) {
    this.setState({
      imageSkeleton: _.defaults({ kenburns: value }, this.state.imageSkeleton)
    });
  },
  onChangeShuffle: function (value) {
    this.setState({
      shuffle: value
    });
  },
  onChangeWithTransition: function (value) {
    this.setState({
      withTransition: value
    });
  },
  onChangeTransitionSkeleton: function (value) {
    this.setState({
      transitionSkeleton: value
    });
  },
  onChangeImageDuration: function (value) {
    this.setState({
      imageSkeleton: _.defaults({ duration: value }, this.state.imageSkeleton)
    });
  },
  render: function () {
    var transitionSkeleton = this.state.transitionSkeleton;
    var width = 600;

    return <div className="bootstrap" style={{ margin: "10px auto", width: width+"px" }}>

      <h1>Bootstrap a new Diaporama</h1>
      <blockquote>
        <strong>Welcome to Diaporama Maker Editor!</strong>
        This first step will help you bootstrapping a first version of the diaporama from the current folder.<br/>
      </blockquote>

      <h2 className="section"><Icon name="picture-o" />Bootstrap Images</h2>

      <BooleanInput title="Pick all images from folder and sub-folders..." value={this.state.pickAllImages} onChange={this.onChangePickAllImages} />
      {!this.state.pickAllImages ? undefined : <div className="image-properties">
        <DurationInput title="Duration of each image:" value={this.state.imageSkeleton.duration} onChange={this.onChangeImageDuration} />
        <BooleanInput title="Apply a generic kenburns effect" value={!!this.state.withKenburns} onChange={this.onChangeWithKenburns} />
        {!this.state.withKenburns ? undefined :
          <KenBurnsEditor
            value={this.state.imageSkeleton.kenburns}
            onChange={this.onChangeKenburns}
            width={width}
            height={width * 0.75}
            image={images.fromImage.src}
            progress={this.state.progress}
          />
        }

        <BooleanInput title="Initially shuffle images" value={this.state.shuffle} onChange={this.onChangeShuffle} />

        <h2 className="section"><Icon name="magic" />Bootstrap Transitions</h2>

        <BooleanInput title={"Add a transition between all images: "} value={this.state.withTransition} onChange={this.onChangeWithTransition} />
        {!this.state.withTransition ? undefined : <div className="transition-properties">
          <TransitionCustomizer
            value={this.state.transitionSkeleton}
            onChange={this.onChangeTransitionSkeleton}
            width={width}
          />
        </div>}

      </div> }

      <h2 className="section"><Icon name="cogs" />Bootstrap the diaporama</h2>

      { !this.state.pickAllImages ?
        <div className="buttons">
          <a href="#" onClick={this.submit}>
            <Icon name="gears" />
            &nbsp;
            ...or just Generate an empty project
          </a>
        </div>

        :
        <div>

          <BooleanInput title="also Generate a standalone index.html to run the diaporama." value={this.state.withHTML} onChange={this.onChangeWithHTML} />

          <div className="settings-preview">
            <h3>Settings Preview</h3>
            <DiaporamaElement
              GlslTransitions={GlslTransitions}
              width={width}
              height={width * 0.75}
              data={this.generateDiaporamaExample()}
              autoplay={true}
              loop={true}
            />
            <div className="buttons">
              <a href="#" onClick={this.submit}>
                <Icon name="gears" />
                &nbsp;
                Generate
              </a>
            </div>
          </div>
        </div>
      }
    </div>;
  }
});

module.exports = Bootstrap;
