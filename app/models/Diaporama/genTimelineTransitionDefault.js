var _ = require("lodash");

module.exports = function (defs, template) {
  return _.extend(
    { duration: 1000 },
    template ? _.cloneDeep(template) : {},
    defs);
};
