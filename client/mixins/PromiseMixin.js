var Q = require("q");

function UnmountedComponentError (message) {
  this.message = message;
  this.stack = (new Error()).stack;
}
UnmountedComponentError.prototype = new Error();
UnmountedComponentError.prototype.name = "UnmountedComponentError";

var PromiseMixin = {
  UnmountedComponentError: UnmountedComponentError,
  recoverUnmountedQ: function (e) {
    if (e instanceof UnmountedComponentError)
      return;
    else
      throw e;
  },
  // Promified setState
  setStateQ: function (state) {
    var d = Q.defer();
    if (this.isMounted())
      this.setState(state, d.resolve);
    else
      d.reject(new UnmountedComponentError("setStateQ: Component is not mounted"));
    return d.promise;
  },
  // Promified replaceState
  replaceStateQ: function (nextState) {
    var d = Q.defer();
    if (this.isMounted())
      this.replaceState(nextState, d.resolve);
    else
      d.reject(new UnmountedComponentError("replaceStateQ: Component is not mounted"));
    return d.promise;
  },
  // Promified forceUpdate
  forceUpdateQ: function () {
    var d = Q.defer();
    if (this.isMounted())
      this.forceUpdate(d.resolve);
    else
      d.reject(new UnmountedComponentError("forceUpdateQ: Component is not mounted"));
    return d.promise;
  },
  // When a Promise ends, force a rendering update
  watchQ: function (promise) {
    var self = this;
    return promise.fin(function () {
      return self.forceUpdateQ().fail(function (e) {
        if (e instanceof UnmountedComponentError) {
          return Q(); // Component is unmounted, all is fine. no need for refresh.
        }
        else {
          throw e;
        }
      });
    });
  }
};

module.exports = PromiseMixin;
