var postcss = require('postcss')

var IMPORTANT = /\s*!important\s*$/i

var unitless = {
  'box-flex': true,
  'box-flex-group': true,
  'column-count': true,
  'flex': true,
  'flex-grow': true,
  'flex-positive': true,
  'flex-shrink': true,
  'flex-negative': true,
  'font-weight': true,
  'line-clamp': true,
  'line-height': true,
  'opacity': true,
  'order': true,
  'orphans': true,
  'tab-size': true,
  'widows': true,
  'z-index': true,
  'zoom': true,
  'fill-opacity': true,
  'stroke-dashoffset': true,
  'stroke-opacity': true,
  'stroke-width': true
}

function dashify (str) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/^ms-/, '-ms-')
    .toLowerCase()
}

function decl (parent, name, value) {
  if (value === false || value === null) return

  name = dashify(name)
  if (typeof value === 'number') {
    if (value === 0 || unitless[name]) {
      value = value.toString()
    } else {
      value += 'px'
    }
  }

  if (name === 'css-float') name = 'float'

  if (IMPORTANT.test(value)) {
    value = value.replace(IMPORTANT, '')
    parent.push(postcss.decl({ prop: name, value: value, important: true }))
  } else {
    parent.push(postcss.decl({ prop: name, value: value }))
  }
}

function atRule (parent, parts, value) {
  var node = postcss.atRule({ name: parts[1], params: parts[3] || '' })
  if (typeof value === 'object') {
    node.nodes = []
    parse(value, node)
  }
  parent.push(node)
}

function parse (obj, parent) {
  var name, value, node, i
  for (name in obj) {
    if (obj.hasOwnProperty(name)) {
      value = obj[name]
      if (value === null || typeof value === 'undefined') {
        continue
      } else if (name[0] === '@') {
        var parts = name.match(/@([^\s]+)(\s+([\w\W]*)\s*)?/)
        if (Array.isArray(value)) {
          for (i = 0; i < value.length; i++) {
            atRule(parent, parts, value[i])
          }
        } else {
          atRule(parent, parts, value)
        }
      } else if (Array.isArray(value)) {
        for (i = 0; i < value.length; i++) {
          decl(parent, name, value[i])
        }
      } else if (typeof value === 'object') {
        node = postcss.rule({ selector: name })
        parse(value, node)
        parent.push(node)
      } else {
        decl(parent, name, value)
      }
    }
  }
}

module.exports = function (obj) {
  var root = postcss.root()
  parse(obj, root)
  return root
}
