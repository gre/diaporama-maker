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
      .fps(opts.fps)
      .input(imageStream)
      .inputFormat("image2pipe")
      .addInputOption('-c:v', 'mjpeg')
      .outputFormat("avi");
  }
};


module.exports = Video;
