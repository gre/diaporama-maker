var React = require("react/addons");
var PureRenderMixin = React.addons.PureRenderMixin;
var Icon = require("../Icon");
var packageJson = require("../../../package.json");

var ErrorScreen = React.createClass({
  mixins: [PureRenderMixin],

  render: function () {
    var e = this.props.error;
    if (e && e.stack)
      console.log(e.stack);
    var msg = e.message || e;
    if (e instanceof window.XMLHttpRequest) {
      msg = e.status+" "+e.statusText;
    }

    var linkStyle = {
      textDecoration: "none",
      color: "#f90"
    };

    var reportBugUrl = "https://github.com/gre/diaporama-maker/issues/new?"+
      "title="+encodeURIComponent("Crash Report: "+msg)+
      "&body="+encodeURIComponent("<Provide any extra detail>\n\n**Version:**\n```\n"+packageJson.version+"\n```\n**Log detail:**\n```\n"+(e && e.stack || (e+"\n"+msg))+"\n```");

    return <div>
      <h2>
        <Icon name="meh-o" />&nbsp;Oops
      </h2>
      <strong><code>{msg}</code></strong>
      <p>
        <a style={linkStyle} href="">
          <Icon name="refresh" />&nbsp;Reload
        </a>
      </p>

      <p>
        <a target="_blank" style={linkStyle} href={reportBugUrl}>
          <Icon name="heart" /> Report this Bug
        </a>
      </p>
    </div>;
  }
});

module.exports = ErrorScreen;
