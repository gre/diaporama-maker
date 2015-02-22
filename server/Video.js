var ffmpeg = require("fluent-ffmpeg");

function Video (options) {
  this.options = options;
}

Video.prototype = {
  feed: function (imageStream, outStream) {
    var opts = this.options;
    return ffmpeg({
      logger: console
    })
      .input(imageStream)
      .inputFormat("image2pipe")
      .fps(opts.fps)
      .videoCodec('libx264')
      .writeToStream(outStream, { end: true });
  }
};


module.exports = Video;
