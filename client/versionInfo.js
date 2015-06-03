import Qajax from "qajax";
import current from "../package.json";

const distantData = Qajax.getJSON("/registry");

export default distantData.then(function (registry) {
  const currentVersion = current.version;
  const latestVersion = registry["dist-tags"].latest;
  return {
    registry,
    currentVersion,
    latestVersion,
    outdated: latestVersion !== current.version
  };
});
