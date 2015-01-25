var m = require("mithril");
var App = require("./App");

m.module(document.body, {
  controller: App,
  view: App.render
});
