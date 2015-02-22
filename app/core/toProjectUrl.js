
function toProjectUrl (url, quality) {
  // TODO: use smaller images to improve performances
  //return "/preview/"+url+(!quality ? "" : "?quality="+quality);
  return "/preview/"+url;
}

toProjectUrl.Quality = {
  THUMBNAIL: "thumbnail"
};

module.exports = toProjectUrl;
