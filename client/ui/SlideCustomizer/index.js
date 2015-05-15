require('brace');
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
  }

  onChange (value) {
    try {
      var obj = JSON.parse(value);
      this.props.onChange(obj);
    }
    catch (e) {}
  }

  render () {
    return <AceEditor
      mode="json"
      theme="solarized_dark"
      onChange={this.onChange}
      defaultValue={beautify(this.props.value, null, 2, 80)}
      name="slide_customizer"
      width={this.props.width + "px"}
      height={this.props.height + "px"}
    />;
  }

}
