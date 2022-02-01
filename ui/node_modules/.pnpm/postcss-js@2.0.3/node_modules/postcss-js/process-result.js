var objectify = require('./objectifier')

module.exports = function (result) {
  if (console && console.warn) {
    result.warnings().forEach(function (warn) {
      var source = warn.plugin || 'PostCSS'
      console.warn(source + ': ' + warn.text)
    })
  }
  return objectify(result.root)
}
