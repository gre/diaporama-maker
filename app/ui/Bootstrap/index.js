var React = require("react");
var _ = require("lodash");
var GlslTransitions = require("glsl-transitions");

var BooleanInput = require("../BooleanInput");
var ImageCustomizer = require("../ImageCustomizer");
var TransitionCustomizer = require("../TransitionCustomizer");
var DiaporamaElement = require("../DiaporamaElement");
var Icon = require("../Icon");
var Button = require("../Button");

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
      pickAllImages: true,
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

    var h1Style = {
      fontSize: "2em",
      marginLeft: "-40px"
    };

    var h2SectionStyle = {
      margin: "50px 0 10px -40px"
    };

    var h3Style = {
      position: "absolute",
      top: "5px",
      right: "10px",
      color: "#fff",
      opacity: 0.6,
      padding: 0,
      margin: 0
    };

    var fieldStyle = {
      marginTop: "20px 0 0 0"
    };

    var subOptionsStyle = {
      marginLeft: "20px"
    };

    var settingsPreviewStyle = {
      position: "relative",
      marginTop: "20px"
    };

    var blockquoteStyle = {
      fontStyle: "italic",
      position: "relative",
      margin: "0.8em 0",
      color: "#999",
      fontSize: "1em",
      lineHeight: "1.5em",
      paddingLeft: "1em",
      borderLeft: "4px solid #ddd"
    };

    var buttonsStyle = {
      textAlign: "center",
      position: "absolute",
      width: "100%",
      top: "45%"
    };

    return <div style={{ margin: "10px auto", width: width+"px" }}>

      <h1 style={h1Style}>Bootstrap a new Diaporama</h1>
      <blockquote style={blockquoteStyle}>
        <strong>Welcome to Diaporama Maker!</strong>
        This first step will help you bootstrapping a first version of the diaporama from the current folder.<br/>
      </blockquote>

      <h2 style={h2SectionStyle}><Icon name="folder-open" />&nbsp;Bootstrap Library</h2>

      <blockquote style={blockquoteStyle}>
        Import images from local directory.
      </blockquote>

      <BooleanInput style={fieldStyle} title="Pick all images from folder and sub-folders..." value={this.state.pickAllImages} onChange={this.onChangePickAllImages} />

      <div style={{ display: this.state.pickAllImages ? "block" : "none" }}>

        <div style={subOptionsStyle}>
          <BooleanInput style={fieldStyle} title="Initially shuffle images" value={this.state.shuffle} onChange={this.onChangeShuffle} />
        </div>

        <h2 style={h2SectionStyle}><Icon name="picture-o" />&nbsp;Bootstrap Images</h2>

        <blockquote style={blockquoteStyle}>
          Configure the Image settings for all images.
        </blockquote>

        <div>

          <ImageCustomizer
            value={imageSkeleton}
            onChange={this.onChangeImageSkeleton}
            width={width}
          />


          <h2 style={h2SectionStyle}><Icon name="magic" />&nbsp;Bootstrap Transitions</h2>

          <blockquote style={blockquoteStyle}>
            Configure the Transition settings for all images.
          </blockquote>

          <BooleanInput style={fieldStyle} title={"Enable transitions between all images."} value={this.state.withTransition} onChange={this.onChangeWithTransition} />
          <div style={{ display: this.state.withTransition ? "block": "none" }}>
            <TransitionCustomizer
              value={transitionSkeleton}
              onChange={this.onChangeTransitionSkeleton}
              width={width}
            />
          </div>

        </div>

      </div>

      <h2 style={h2SectionStyle}><Icon name="cogs" />&nbsp;Bootstrap the Diaporama</h2>

      { !this.state.pickAllImages ?
        <div>
          <Button onClick={this.submit} fontSize="1.4em" color="#fff" bgHover="#000" bg="#222">
            <Icon name="gears" />
            &nbsp;
            Generate an empty project
          </Button>
        </div>

        :
        <div>

          <div style={settingsPreviewStyle}>
            <h3 style={h3Style}>Settings Preview</h3>
            <DiaporamaElement
              GlslTransitions={GlslTransitions}
              width={width}
              height={width * 0.75}
              data={this.generateDiaporamaExample()}
              autoplay={true}
              loop={true}
            />
            <div style={buttonsStyle}>
              <Button onClick={this.submit} fontSize="3em" colorHover="#000" color="#333" bgHover="#fff">
                <Icon name="gears" />
                &nbsp;
                Generate
              </Button>
            </div>
          </div>
        </div>
      }
    </div>;
  }
});

module.exports = Bootstrap;
