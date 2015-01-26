var loader = require("./loader");
var computeThumbnail = require("./computeThumbnail");

function ThumbnailCache () {
  this._cache = {};
}

ThumbnailCache.prototype = {
  destroy: function () {
    for (var k in this._cache)
      delete this._cache[k];
    delete this._cache;
  },
  get: function (url, w, h) {
    var img = loader.image.get(url);
    var cache = this._cache[url];
    if (cache && cache.w === w && cache.h === h && img === cache.img) {
      return cache.value;
    }
    this._cache[url] = cache = {
      value: computeThumbnail.fromImage(img, w, h),
      img: img,
      w: w,
      h: h
    };
    return cache.value;
  }
};

module.exports = ThumbnailCache;
