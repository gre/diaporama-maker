var React = require("react");
var _ = require("lodash");
var GlslTransitions = require("glsl-transitions");

var BooleanInput = require("../BooleanInput");
var ImageCustomizer = require("../ImageCustomizer");
var TransitionCustomizer = require("../TransitionCustomizer");
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
      withTransition: true,
      imageSkeleton: {
        duration: 2000
      },
      transitionSkeleton: {
        duration: 1000
      },
      progress: 0
    };
  },
  computeTimelineSkeleton: function () {
    var skeleton = _.clone(this.state.imageSkeleton);
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
      timelineSkeleton: this.computeTimelineSkeleton()
    };
    this.props.onSubmit(data);
  },
  onChangePickAllImages: function (value) {
    this.setState({
      pickAllImages: value
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
  onChangeImageSkeleton: function (value) {
    this.setState({
      imageSkeleton: value
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
    var imageSkeleton = this.state.imageSkeleton;
    var transitionSkeleton = this.state.transitionSkeleton;
    var width = 600;

    return <div className="bootstrap" style={{ margin: "10px auto", width: width+"px" }}>

      <h1>Bootstrap a new Diaporama</h1>
      <blockquote>
        <strong>Welcome to Diaporama Maker!</strong>
        This first step will help you bootstrapping a first version of the diaporama from the current folder.<br/>
      </blockquote>

      <h2 className="section"><Icon name="folder-open" />Bootstrap Library</h2>

      <blockquote>
        Import images from local directory.
      </blockquote>

      <BooleanInput title="Pick all images from folder and sub-folders..." value={this.state.pickAllImages} onChange={this.onChangePickAllImages} />

      <div style={{ display: this.state.pickAllImages ? "block" : "none" }}>

        <div className="sub-options">
          <BooleanInput title="Initially shuffle images" value={this.state.shuffle} onChange={this.onChangeShuffle} />
        </div>

        <h2 className="section"><Icon name="picture-o" />Bootstrap Images</h2>

        <blockquote>
          Configure the Image settings for all images.
        </blockquote>

        <div className="image-properties">

          <ImageCustomizer
            value={imageSkeleton}
            onChange={this.onChangeImageSkeleton}
            width={width}
          />


          <h2 className="section"><Icon name="magic" />Bootstrap Transitions</h2>

          <blockquote>
            Configure the Transition settings for all images.
          </blockquote>

          <BooleanInput title={"Enable transitions between all images."} value={this.state.withTransition} onChange={this.onChangeWithTransition} />
          <div className="transition-properties" style={{ display: this.state.withTransition ? "block": "none" }}>
            <TransitionCustomizer
              value={transitionSkeleton}
              onChange={this.onChangeTransitionSkeleton}
              width={width}
            />
          </div>

        </div>

      </div>

      <h2 className="section"><Icon name="cogs" />Bootstrap the Diaporama</h2>

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
