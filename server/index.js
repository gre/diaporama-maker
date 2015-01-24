var browserify = require('browserify');
var express = require('express');
var serverStatic = require('serve-static');
var path = require('path');
var Q = require('q');

module.exports = function server (diaporama, port) {
  var app = express();

  if (!port) port = 9325;

  app.use(serverStatic(path.join(__dirname, '../app'), { 'index': ['index.html'] }));
  app.use(serverStatic('.'));

  app.get('/._diaporama.build.js', function (req, res) {
    var b = browserify();
    b.add(path.join(__dirname, '../app/index.js'));
    b.bundle().pipe(res);
  });

  app.listen(port);
  var url = "http://localhost:"+port;
  console.log("Listening on "+url);

  return Q(url).delay(100);
};
