var React = require("react/addons");
window.React = React;
window.Perf = React.addons.Perf;

import Q from "q";
import Qajax from "qajax";
var url = require("url");
import Diaporama from "./models/Diaporama";
import isImage from "../common/isImage";

const DiaporamaMakerAPI = {
  fromImage: "/assets/images/1.jpg",
  toImage: "/assets/images/2.jpg",

  toProjectUrl (url, fullSize) {
    return "/preview/"+url+(fullSize ? "" : "?format=thumbnail");
  },

  diaporamaZipUrl (options) {
    return url.format({
      query: options,
      pathname: "/diaporama/generate/zip"
    });
  },

  diaporamaJsonUrl () {
    return "/diaporama.json";
  },

  bootstrapDiaporama (options) {
    return Qajax({
      method: "POST",
      url: "/diaporama/bootstrap",
      data: options
    })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(Diaporama.fromBootstrap);
  },

  saveDiaporama (diaporama) {
    // TODO: replace with using network
    return Qajax({
      method: "POST",
      url: "/diaporama.json",
      data: Diaporama.clean(diaporama)
    })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON);
  },

  fetchDiaporama () {
    return Qajax({
      method: "GET",
      url: "/diaporama.json"
    })
    .then(Qajax.filterStatus(200))
    .then(Qajax.toJSON)
    .then(Diaporama.fromFetch)
    .fail(function (maybeXhr) {
      if (maybeXhr && maybeXhr.status === 204) {
        return null; // recover No Content
      }
      throw maybeXhr;
    });
  },

  listItems () {
    return Qajax({
      method: "GET",
      url: "/listfiles"
    })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(files => files.map(file =>
      isImage(file) ? {
        id: file,
        image: file,
        title: file
      }
      :
      {
        id: file,
        file: file,
        title: file
      }
    ));
  },

  uploadFiles (files) {
    const form = new window.FormData();
    files.forEach(f => {
      form.append("file", f);
    });

    return Qajax({
      method: "POST",
      url: "/upload",
      data: form
    })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON);
  }
};

window.App = require("./ui/App");
window.DiaporamaMakerAPI = DiaporamaMakerAPI;
