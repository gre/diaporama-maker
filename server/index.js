var express = require("express");
var serverStatic = require('serve-static');
var bodyParser = require('body-parser');
var path = require('path');
var Q = require('q');
var Http = require('http');
var findAllFiles = require("./findAllFiles");
var isImage = require("../common/isImage");
var Thumbnail = require("./Thumbnail");
var fs = require("./fs");
var portscanner = require('portscanner');

module.exports = function server (diaporama) {
  var app = express();
  var http = Http.Server(app);

  app.use(bodyParser.json());

  var defer = Q.defer();

  portscanner.findAPortNotInUse(9325, 9350, '127.0.0.1', function(err, port) {
    if (err) defer.reject(err);
    else {
      http.listen(port, function () {
        var url = "http://localhost:"+port;
        console.log("Listening on "+url);
        defer.resolve(url);
      });
    }
  });

  app.get('/index.js', function (req, res) {
    fs.createReadStream(path.join(__dirname, '../builds/app.bundle.js'))
      .pipe(res.type("js"));
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


  app.get('/preview/diaporama.bundle.js', function (req, res) {
    fs.createReadStream(path.join(__dirname, '../builds/diaporama.bundle.js'))
      .pipe(res.type("js"));
  });
  app.use("/preview", serverStatic(path.join(__dirname, '../bootstrap'), { 'index': ['index.html'] }));

  Thumbnail(app, "preview", diaporama.dir);

  app.use(serverStatic(path.join(__dirname, '../static'), { 'index': ['index.html'] }));

  return defer.promise;
};
