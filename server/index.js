var watchify = require('watchify');
var browserify = require('browserify');
var express = require("express");
var serverStatic = require('serve-static');
var bodyParser = require('body-parser');
var path = require('path');
var Q = require('q');
var findAllFiles = require("./findAllFiles");
var isImage = require("../common/isImage");
var Thumbnail = require("./Thumbnail");

// var isProd = process.env.NODE_ENV === "production";

var b = browserify(watchify.args);
b.transform(require("babelify").configure({
  ignore: /.*.json/
}));
b.add(path.join(__dirname, '../app/index.js'));
var w = watchify(b);
w.on('update', function () {
  console.log("Bundle.");
  w.bundle();
});

module.exports = function server (diaporama, port) {
  var app = express();

  var http = require('http').Server(app);
  // var io = require('socket.io')(http);

  // TODO: different ports when used
  if (!port) port = 9325;

  app.use(bodyParser.json());

  app.get('/index.js', function (req, res) {
    w.bundle().pipe(res.type("js"));
  });

  app.get('/listfiles', function (req, res) {
    findAllFiles(diaporama.dir, isImage)
      .then(JSON.stringify)
      .then(function (json) {
        res.type("json").send(json);
      }, function (e) {
        console.error(e);
        res.status(400).send(e.message);
      });
  });

  app.get("/diaporama/generate/zip", function (req, res) {
    var archive = diaporama.zip(req.query);
    archive.on('error', function(err) {
      res.status(500).send({error: err.message});
    });
    res.on('close', function() {
      console.log('zip %d bytes', archive.pointer());
      return res.status(200).send('OK').end();
    });
    res.attachment('diaporama.zip');
    archive.pipe(res);
  });

  app.get('/diaporama.json', function(req, res) {
    if (!diaporama.json)
      res.status(204).send();
    else
      res.type("json").send(JSON.stringify(diaporama.json));
  });

  app.post('/diaporama.json', function(req, res) {
    diaporama.trySet(req.body)
      .post("save")
      .then(function () {
        res.type("json").send({});
      }, function (e) {
        console.error(e);
        res.status(400).send(e.message);
      })
      .done();
  });

  Thumbnail(app, "preview", diaporama.dir);

  app.use(serverStatic(path.join(__dirname, '../app'), { 'index': ['index.html'] }));

  var defer = Q.defer();
  http.listen(port, function (err) {
    if (err) defer.reject(err);
    else {
      var url = "http://localhost:"+port;
      console.log("Listening on "+url);
      defer.resolve(url);
    }
  });

  return defer.promise;
};
