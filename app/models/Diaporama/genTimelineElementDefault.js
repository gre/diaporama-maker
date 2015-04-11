var _ = require("lodash");

module.exports = function (image, template) {
  return _.extend(
    {
      duration: 4000,
      transitionNext: {
        duration: 1000
      }
    },
    template ? _.cloneDeep(template) : {},
    { image: image });
};
