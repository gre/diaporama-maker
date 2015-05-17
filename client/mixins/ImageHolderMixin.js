

var ImageHolderMixin = {

  fetchImage: function (props) {
    var img = new window.Image();
    this.img = img;
    if (!props.image) return;
    this.curImgSrc = img.src = props.image;
    var self = this;
    img.onload = function () {
      if (self.onImageLoaded) self.onImageLoaded(img);
      if (self.isMounted())
        self.forceUpdate();
    };
  },

  componentWillMount: function () {
    this.fetchImage(this.props);
  },

  componentWillReceiveProps: function (props) {
    if (!this.curImgSrc || this.curImgSrc !== props.image) {
      this.fetchImage(props);
    }
  }

};

module.exports = ImageHolderMixin;
