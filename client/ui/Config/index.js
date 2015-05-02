import React from "react";
import TransitionCustomizer from "../TransitionCustomizer";
import ImageCustomizer from "../ImageCustomizer";
import Diaporama from "../../models/Diaporama";

export default class Config extends React.Component {

  constructor (props) {
    super(props);
    this.onImageChange = this.onImageChange.bind(this);
    this.onTransitionChange = this.onTransitionChange.bind(this);
  }

  onImageChange (defs) {
    this.props.alterDiaporama("setDefaultElement", defs);
  }

  onTransitionChange (tdefs) {
    const {
      alterDiaporama,
      diaporama
    } = this.props;
    const defs = Diaporama.getDefaultElement(diaporama, { transitionNext: tdefs });
    alterDiaporama("setDefaultElement", defs);
  }

  render () {
    const {
      diaporama,
      width,
      openTransitionPicker
    } = this.props;
    const defaults = Diaporama.getDefaultElement(diaporama);
    return <div>
      <h3>Default Element</h3>
      <ImageCustomizer
        value={defaults}
        onChange={this.onImageChange}
        width={width}
        displayDuration={true}
      />
      <h3>Default Transition</h3>
      <TransitionCustomizer
        value={defaults.transitionNext}
        onChange={this.onTransitionChange}
        width={width}
        images={[ DiaporamaMakerAPI.fromImage, DiaporamaMakerAPI.toImage ]}
        animated={false}
        openTransitionPicker={openTransitionPicker}
        displayDuration={true}
      />
    </div>;
  }

}
