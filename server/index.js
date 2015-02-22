var browserify = require('browserify');
var uglify = require("uglify-stream");
var stylus = require("stylus");
var express = require("express");
var nib = require("nib");
var serverStatic = require('serve-static');
var bodyParser = require('body-parser');
var path = require('path');
var Q = require('q');
var fs = require('q-io/fs');
var findAllFiles = require("./findAllFiles");
var isImage = require("../common/isImage");

module.exports = function server (diaporama, port) {
  var app = express();

  // TODO: ports
  if (!port) port = 9325;

  app.use(bodyParser.json());

  app.get('/index.js', function (req, res) {
    var b = browserify();
    b.transform(require("reactify"));
    b.add(path.join(__dirname, '../app/index.js'));
    b.bundle().pipe(res.type("js"));
  });

  app.get('/index.css', function (req, res) {
    fs.read(path.join(__dirname, '../app/index.styl'))
      .then(function (styl) {
        return stylus(styl)
          .set('paths', [
            path.join(__dirname, '../node_modules'),
            path.join(__dirname, '../app')
            ])
          .use(nib()).import('nib');
      })
      .ninvoke("render")
      .then(function (css) {
        res.type("css").send(css);
      }, function (e) {
        console.error(e);
        res.status(400).send(e.message);
      });
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

  app.post("/diaporama/bootstrap", function (req, res) {
    diaporama.bootstrap(req.body)
      .then(function (diaporama) {
        res.type("json").send(JSON.stringify(diaporama.json));
      })
      .fail(function (e) {
        console.error(e);
        res.status(400).send(e.message);
      });
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

  app.use("/preview", serverStatic('.'));

  app.use(serverStatic(path.join(__dirname, '../app'), { 'index': ['index.html'] }));

  app.listen(port);
  var url = "http://localhost:"+port;
  console.log("Listening on "+url);

  return Q(url).delay(100);
};
