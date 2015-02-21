var Q = require("q");

var d1 = Q.defer();
var d2 = Q.defer();
var fromImage = new window.Image();
var toImage = new window.Image();
fromImage.onload = d1.resolve; fromImage.onerror = d1.reject;
toImage.onload = d2.resolve; toImage.onerror = d2.reject;
fromImage.src = "/static/images/1.jpg";
toImage.src = "/static/images/2.jpg";
var ready = Q.all([ d1.promise, d2.promise ]);


module.exports = {
  ready: ready,
  fromImage: fromImage,
  toImage: toImage
};
