var ffmpeg = require("fluent-ffmpeg");

var logger = {
  debug: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};

function Video (options) {
  this.options = options;
}

Video.prototype = {
  feed: function (imageStream) {
    var opts = this.options;
    return ffmpeg({
      logger: logger
    })
      .input(imageStream)
      .inputFormat("image2pipe")
      .addInputOption('-vcodec', 'mjpeg')
      .outputFormat("avi")
      .fps(opts.fps);
  }
};


module.exports = Video;
