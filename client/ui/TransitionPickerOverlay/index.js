import React, { PropTypes } from "react";
import Transitions from "../Transitions";

const propTypes = {
  onClose: PropTypes.func.isRequired,
  onSelectTransition: PropTypes.func.isRequired,
  bounds: PropTypes.arrayOf(PropTypes.number).isRequired,
  images: PropTypes.array.isRequired,
  transitionCollection: PropTypes.array.isRequired
};

export default class TransitionPickerOverlay extends React.Component {

  render () {
    const {
      onClose,
      onSelectTransition,
      bounds,
      images,
      transitionCollection
    } = this.props;
    const style = {
      position: "relative"
    };
    const overlayStyle = {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "block",
      zIndex: 1000,
      background: "rgba(0,0,0,0.5)"
    };
    const overlayPopinStyle = {
      position: "absolute",
      left: bounds[0]+"px",
      top: bounds[1]+"px",
      background: "#fff",
      zIndex: 1001
    };

    return <div style={style}>
      <div style={overlayStyle} onClick={onClose} />
      <div style={overlayPopinStyle}>
        <Transitions
          width={bounds[2]}
          height={bounds[3]}
          images={images}
          onTransitionSelected={onSelectTransition}
          transitionCollection={transitionCollection}
          onClose={onClose}
        />
      </div>
    </div>;
  }
}

TransitionPickerOverlay.propTypes = propTypes;
