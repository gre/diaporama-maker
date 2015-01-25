module.exports = function boundToStyle (bound) {
  return bound ? {
    position: "absolute",
    left: bound.x+"px",
    top: bound.y+"px",
    width: bound.width+"px",
    height: bound.height+"px"
  } : {};
};
