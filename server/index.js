var browserify = require('browserify');
var express = require('express');
var serverStatic = require('serve-static');
var bodyParser = require('body-parser');
var path = require('path');
var Q = require('q');

module.exports = function server (diaporama, port) {
  var app = express();

  if (!port) port = 9325;

  app.use(bodyParser.json());

  app.get('/index.js', function (req, res) {
    var b = browserify();
    b.add(path.join(__dirname, '../app/index.js'));
    b.bundle().pipe(res);
  });

  app.get('/diaporama.json', function(req, res) {
    res.send(JSON.stringify(diaporama.json));
  });

  app.post('/diaporama.json', function(req, res) {
    diaporama.trySet(req.body)
      .post("save")
      .then(function () {
        res.status(200).send();
      }, function (e) {
        res.status(400).send(e.message);
      })
      .done();
  });

  app.use("/project", serverStatic('.'));

  app.use(serverStatic(path.join(__dirname, '../app'), { 'index': ['index.html'] }));

  app.listen(port);
  var url = "http://localhost:"+port;
  console.log("Listening on "+url);

  return Q(url).delay(100);
};
