var React = require("react/addons");

window.Perf = React.addons.Perf;

var App = require("./ui/App");

// TODO: in the future, we will have parameters to App: the way to provide the instance specifics (api, etc..)
React.render(<App />, document.body);
