var postcss = require('postcss')
var parser = require('postcss-selector-parser')

function parse (str, rule) {
  var nodes
  var saver = parser(function (parsed) {
    nodes = parsed
  })
  try {
    saver.processSync(str)
  } catch (e) {
    if (str.indexOf(':') !== -1) {
      throw rule ? rule.error('Missed semicolon') : e
    } else {
      throw rule ? rule.error(e.message) : e
    }
  }
  return nodes.at(0)
}

function replace (nodes, parent) {
  var replaced = false
  nodes.each(function (i) {
    if (i.type === 'nesting') {
      var clonedParent = parent.clone()
      if (i.value !== '&') {
        i.replaceWith(parse(i.value.replace('&', clonedParent.toString())))
      } else {
        i.replaceWith(clonedParent)
      }
      replaced = true
    } else if (i.nodes) {
      if (replace(i, parent)) {
        replaced = true
      }
    }
  })
  return replaced
}

function selectors (parent, child) {
  var result = []
  parent.selectors.forEach(function (i) {
    var parentNode = parse(i, parent)

    child.selectors.forEach(function (j) {
      var node = parse(j, child)
      var replaced = replace(node, parentNode)
      if (!replaced) {
        node.prepend(parser.combinator({ value: ' ' }))
        node.prepend(parentNode.clone())
      }
      result.push(node.toString())
    })
  })
  return result
}

function pickComment (comment, after) {
  if (comment && comment.type === 'comment') {
    after.after(comment)
    return comment
  } else {
    return after
  }
}

function atruleChilds (rule, atrule, bubbling) {
  var children = []
  atrule.each(function (child) {
    if (child.type === 'comment') {
      children.push(child)
    } else if (child.type === 'decl') {
      children.push(child)
    } else if (child.type === 'rule' && bubbling) {
      child.selectors = selectors(rule, child)
    } else if (child.type === 'atrule') {
      atruleChilds(rule, child, bubbling)
    }
  })
  if (bubbling) {
    if (children.length) {
      var clone = rule.clone({ nodes: [] })
      for (var i = 0; i < children.length; i++) {
        clone.append(children[i])
      }
      atrule.prepend(clone)
    }
  }
}

function pickDeclarations (selector, declarations, after) {
  var parent = postcss.rule({
    selector: selector,
    nodes: []
  })

  for (var i = 0; i < declarations.length; i++) {
    parent.append(declarations[i])
  }

  after.after(parent)
  return parent
}

function processRule (rule, bubble, unwrap, preserveEmpty) {
  var unwrapped = false
  var after = rule
  var copyDeclarations = false
  var declarations = []

  rule.each(function (child) {
    if (child.type === 'rule') {
      if (declarations.length) {
        after = pickDeclarations(rule.selector, declarations, after)
        declarations = []
      }

      copyDeclarations = true
      unwrapped = true
      child.selectors = selectors(rule, child)
      after = pickComment(child.prev(), after)
      after.after(child)
      after = child
    } else if (child.type === 'atrule') {
      copyDeclarations = false

      if (declarations.length) {
        after = pickDeclarations(rule.selector, declarations, after)
        declarations = []
      }

      if (child.name === 'at-root') {
        unwrapped = true
        atruleChilds(rule, child, false)

        var nodes = child.nodes
        if (child.params) {
          nodes = postcss.rule({
            selector: child.params,
            nodes: nodes
          })
        }

        after.after(nodes)
        after = nodes
        child.remove()
      } else if (bubble[child.name]) {
        unwrapped = true
        atruleChilds(rule, child, true)
        after = pickComment(child.prev(), after)
        after.after(child)
        after = child
      } else if (unwrap[child.name]) {
        unwrapped = true
        atruleChilds(rule, child, false)
        after = pickComment(child.prev(), after)
        after.after(child)
        after = child
      }
    } else if (child.type === 'decl' && copyDeclarations) {
      declarations.push(child)
    }
  })

  if (declarations.length) {
    after = pickDeclarations(rule.selector, declarations, after)
  }

  if (unwrapped && preserveEmpty !== true) {
    rule.raws.semicolon = true
    if (rule.nodes.length === 0) rule.remove()
  }
}

function atruleNames (defaults, custom) {
  var list = { }
  var i, name
  for (i = 0; i < defaults.length; i++) {
    list[defaults[i]] = true
  }
  if (custom) {
    for (i = 0; i < custom.length; i++) {
      name = custom[i].replace(/^@/, '')
      list[name] = true
    }
  }
  return list
}

module.exports = postcss.plugin('postcss-nested', function (opts) {
  if (!opts) opts = { }
  var bubble = atruleNames(['media', 'supports'], opts.bubble)
  var unwrap = atruleNames(['document', 'font-face', 'keyframes'], opts.unwrap)
  var preserveEmpty = opts ? opts.preserveEmpty : false

  var process = function (node) {
    node.each(function (child) {
      if (child.type === 'rule') {
        processRule(child, bubble, unwrap, preserveEmpty)
      } else if (child.type === 'atrule') {
        process(child)
      }
    })
  }
  return process
})
