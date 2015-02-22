var ffmpeg = require("fluent-ffmpeg");
var winston = require('winston');

function Video (options) {
  this.options = options;
}

Video.prototype = {
  feed: function (imageStream) {
    var opts = this.options;
    return ffmpeg({
      logger: winston
    })
      .input(imageStream)
      .inputFormat("image2pipe")
      .fps(opts.fps)
      .videoCodec('libx264');
  }
};


module.exports = Video;
