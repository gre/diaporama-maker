var React = require("react");
var _ = require("lodash");

const defaultProps = {
  color: "#000",
  bg: "#fff",
  fontSize: "1em"
};

const propTypes = {
  onClick: React.PropTypes.func,
  color: React.PropTypes.string,
  bg: React.PropTypes.string,
  colorHover: React.PropTypes.string,
  bgHover: React.PropTypes.string,
  fontSize: React.PropTypes.string
};

export default class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false
    };
    this.onClick = this.onClick.bind(this);
    this.hoverEnter = this.hoverEnter.bind(this);
    this.hoverLeave = this.hoverLeave.bind(this);
  }

  hoverEnter () {
    this.setState({
      hover: true
    });
  }

  hoverLeave () {
    this.setState({
      hover: false
    });
  }

  onClick (e) {
    e.preventDefault();
    if (this.props.onClick) this.props.onClick(e);
  }

  render () {
    const {
      children,
      color,
      colorHover,
      bg,
      bgHover,
      fontSize,
      onClick,
      href,
      style,
      target,
      download
    } = this.props;
    const {
      hover
    } = this.state;

    var styles = _.extend({
      padding: '0.2em 0.8em',
      border: 0,
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: fontSize,
      fontWeight: 700,
      color: colorHover && hover ? colorHover : color,
      background: bgHover && hover ? bgHover : bg,
      textDecoration: "none"
    }, style);

    const params = {
      target,
      download,
      href,
      style: styles,
      onClick: onClick ? this.onClick : undefined,
      onMouseEnter: this.hoverEnter,
      onMouseLeave: this.hoverLeave
    };

    return <a {...params}>{children}</a>;
  }
}

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;
