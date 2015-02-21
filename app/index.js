var React = require("react");
var App = require("./ui/App");

require("./resource/images").ready.then(function () {
  React.render(<App />, document.body);
});
