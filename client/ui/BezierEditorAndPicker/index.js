import React from "react";
import BezierPicker from "bezier-easing-picker";
import BezierEditor from "bezier-easing-editor";

const itemStyles = {
  displayName: false
};
const hoverItemStyles = {

};
const selectedItemStyles = {

};

export default class BezierEditorAndPicker extends React.Component {

  render () {
    const {
      value,
      onChange,
      width,
      height,
      progress
    } = this.props;
    const interMargin = 5;
    const pickerW = Math.floor((height-4*interMargin) / 5);
    const pickerH = height;
    const editorW = width - pickerW;
    const editorH = height;
    const paddingH = 20+Math.max(0, editorH - editorW) / 2;
    const paddingW = 20+Math.max(0, editorW - editorH) / 2;
    const style = {
      display: "inline-block",
      width: width+"px",
      height: height+"px"
    };
    return <div style={style}>
      <BezierPicker
        value={value}
        onChange={onChange}
        width={pickerW}
        height={pickerH}
        itemStyles={itemStyles}
        hoverItemStyles={hoverItemStyles}
        selectedItemStyles={selectedItemStyles}
        interMargin={interMargin}
        itemsPerRow={1}
      />
      <BezierEditor
        value={value}
        onChange={onChange}
        width={editorW}
        height={editorH}
        handleRadius={8}
        padding={[paddingH+10, paddingW, paddingH+20, paddingW+10]}
        progress={progress}
        handleColor="#0af"
        progressColor="#fc0"
      />
    </div>;
  }
}
