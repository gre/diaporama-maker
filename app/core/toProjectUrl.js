
module.exports = function (url, fullSize) {
  return "/preview/"+url+(fullSize ? "" : "?format=thumbnail");
};
