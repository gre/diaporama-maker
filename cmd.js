#!/usr/bin/env node

var package = require("./package.json");

var path = require("path");
var fs = require("fs");
var Q = require("q");
var _ = require("lodash");

var readdir = Q.denodeify(fs.readdir);
var readFile = Q.denodeify(fs.readFile);
var writeFile = Q.denodeify(fs.writeFile);

var args = process.argv.slice(2);

if (args.length > 1 || args[0] == "-h" || args[0] == "--help") {
  help();
}

function Diaporama (dir, json) {
  if (!(this instanceof Diaporama)) return new Diaporama(dir, json);
  this.dir = dir;
  this.json = json;
}

Diaporama.jsonfile = "diaporama.json";

Diaporama.fromDirectory = function (dir) {
  return readFile(path.join(dir, Diaporama.jsonfile))
    .then(JSON.parse)
    .then(function (json) {
      return Diaporama(dir, json);
    });
};

Diaporama.prototype = {
  save: function () {
    return writeFile(path.join(this.dir, Diaporama.jsonfile), JSON.stringify(this.json));
  }
};

var cwd = process.cwd();

readdir(cwd)
  .then(function (files) {
    if (!_.contains(files, Diaporama.jsonfile)) {
      return initProject(cwd);
    }
    else {
      return continueProject(cwd);
    }
  })
  .done();

function initProject(path) {
  var diaporama = Diaporama(path, {
    generator: package.version
  });
  return diaporama.save().then(editProject);
}

function continueProject (path) {
  return Diaporama.fromDirectory(path).then(editProject);
}

function editProject (diaporama) {
}

function help () {
  console.error("To initialize / continue a diaporama run:");
  console.error("diaporama <directory>");
  console.error("or");
  console.error("diaporama");
  process.exit(1);
}



