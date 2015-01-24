#!/usr/bin/env node

var Q = require("q");
var _ = require("lodash");
var open = require("open");

var fs = require("./fs");
var Diaporama = require("./Diaporama");
var server = require("../server");

function edit (diaporama) {
  return Q.fcall(server, diaporama).then(open);
}

function help () {
  console.error("To initialize / continue a diaporama run:");
  console.error("diaporama");
  process.exit(1);
}

var args = process.argv.slice(2);

if (args.length > 1 || args[0] === "-h" || args[0] === "--help") {
  help();
}

var cwd = process.cwd();

fs.readdir(cwd)
  .then(function (files) {
    if (!_.contains(files, Diaporama.jsonfile)) {
      return Diaporama.bootstrapDirectory(cwd)
        .post("save")
        .then(edit);
    }
    else {
      return Diaporama.fromDirectory(cwd)
        .then(edit);
    }
  })
  .done();



