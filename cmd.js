#!/usr/bin/env node

var Q = require("q");
var _ = require("lodash");
var open = require("open");

var fs = require("./server/fs");
var Diaporama = require("./server/Diaporama");
var server = require("./server");

function edit (diaporama) {
  return Q.fcall(server, diaporama).then(open);
}

function help () {
  console.error("Usage: diaporama <images directory>");
  console.error("A diaporama.json will be created in that directory.");
  process.exit(1);
}

var args = process.argv.slice(2);

if (args.length !== 1 || args[0] === "-h" || args[0] === "--help") {
  help();
}

var dir = args[0];

fs.readdir(dir)
  .then(function (files) {
    if (!_.contains(files, Diaporama.jsonfile)) {
      return edit(Diaporama.genEmpty(dir));
    }
    else {
      return Diaporama.fromDirectory(dir)
        .then(edit);
    }
  })
  .done();

