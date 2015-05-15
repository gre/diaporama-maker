require('brace');
import Slide2d from "slide2d";
import React from 'react';
import AceEditor from '../ReactAce';
import beautify from "json-beautify";
require('brace/mode/json');
require('brace/theme/solarized_dark');

// TODO: backport Slide2d error
export default class SlideCustomizer extends React.Component {

  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.slide2d = Slide2d(document.createElement("canvas").getContext("2d"));
    this.state = {
      error: null
    };
  }

  onChange (value) {
    try {
      var obj = JSON.parse(value);
      this.slide2d.render(obj);
      this.props.onChange(obj);
      this.setState({ error: null });
    }
    catch (error) {
      console.log(error);
      this.setState({ error });
    }
  }

  render () {
    const {
      width,
      height,
      value
    } = this.props;
    const {
      error
    } = this.state;
    const statusBarHeight = 20;
    const statusBarStyle = {
      width: width+"px",
      height: statusBarHeight+"px",
      background: "#002B36",
      color: "#f33"
    };
    return <div>
      <AceEditor
        mode="json"
        theme="solarized_dark"
        onChange={this.onChange}
        defaultValue={beautify(value, null, 2, 80)}
        name="slide_customizer"
        width={width + "px"}
        height={(height-statusBarHeight) + "px"}
      />
    <div style={statusBarStyle}>{error && error.toString() || ""}</div>
    </div>;
  }

}
