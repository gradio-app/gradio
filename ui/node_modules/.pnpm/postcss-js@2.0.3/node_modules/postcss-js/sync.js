var postcss = require('postcss')

var processResult = require('./process-result')
var parse = require('./parser')

module.exports = function (plugins) {
  var processor = postcss(plugins)
  return function (input) {
    var result = processor.process(input, { parser: parse, from: undefined })
    return processResult(result)
  }
}
