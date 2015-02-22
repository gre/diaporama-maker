var browserify = require('browserify');
var stylus = require("stylus");
var express = require("express");
var nib = require("nib");
var serverStatic = require('serve-static');
var bodyParser = require('body-parser');
var fs = require("fs");
var path = require('path');
var streamBuffers = require("stream-buffers");
var Q = require('q');
var qfs = require('q-io/fs');
var findAllFiles = require("./findAllFiles");
var isImage = require("../common/isImage");
var Diaporama = require("./Diaporama");
var Video = require("./Video");

module.exports = function server (diaporama, port) {
  var app = express();

  var http = require('http').Server(app);
  var io = require('socket.io')(http);

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
    qfs.read(path.join(__dirname, '../app/index.styl'))
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

  app.post("/diaporama/generate/html", function (req, res) {
    Diaporama.generateHTML(diaporama.dir)
      .then(function () {
        res.status(204).send();
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

  io.sockets.on('connection', function (socket) {

    // Handle Video Submission
    socket.once("beginvideo", function beginvideo (options) {
      var frame = 0;
      var video = new Video(options);
      console.log("Receiving video...");

      var input = new streamBuffers.ReadableStreamBuffer();
      var output = fs.createWriteStream('output.avi');

      function videoframe (dataUrl) {
        console.log("frame", frame);
        var buffer = new Buffer(dataUrl.split(",")[1], 'base64');
        input.put(buffer);
        // ...
        frame ++;
      }

      function success () {
        console.log("Video received. "+frame+" frames.");
        input.destroySoon();
      }

      function failure (message) {
        console.log("failure to finalize the video: "+message);
        input.destroySoon();
        output.end();
        // Ensure no file remain created.
      }

      function disconnect () {
        failure("User disconnected.");
      }

      function endvideo (err) {
        if (err) {
          failure(err.message);
        }
        else {
          success();
        }

        socket.removeListener("videoframe", videoframe);
        socket.removeListener("disconnect", disconnect);
        socket.once("beginvideo", beginvideo);
      }

      socket.on("videoframe", videoframe);
      socket.once("disconnect", disconnect);
      socket.once("endvideo", endvideo);

      video.feed(input)
        .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
          socket.emit("videoerror", err.message);
        })
        .on('end', function() {
          console.log('Processing finished !');
          socket.emit("videoend");
        })
        .pipe(output, { end: true });
    });


  });

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
