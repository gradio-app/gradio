let parser = require('postcss-selector-parser')

function parse (str, rule) {
  let nodes
  let saver = parser(parsed => {
    nodes = parsed
  })
  try {
    saver.processSync(str)
  } catch (e) {
    if (str.includes(':')) {
      throw rule ? rule.error('Missed semicolon') : e
    } else {
      throw rule ? rule.error(e.message) : e
    }
  }
  return nodes.at(0)
}

function replace (nodes, parent) {
  let replaced = false
  nodes.each(i => {
    if (i.type === 'nesting') {
      let clonedParent = parent.clone()
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
  let result = []
  parent.selectors.forEach(i => {
    let parentNode = parse(i, parent)

    child.selectors.forEach(j => {
      if (j.length) {
        let node = parse(j, child)
        let replaced = replace(node, parentNode)
        if (!replaced) {
          node.prepend(parser.combinator({ value: ' ' }))
          node.prepend(parentNode.clone())
        }
        result.push(node.toString())
      }
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

function createFnAtruleChilds (bubble) {
  return function atruleChilds (rule, atrule, bubbling) {
    let children = []
    atrule.each(child => {
      if (child.type === 'comment') {
        children.push(child)
      } else if (child.type === 'decl') {
        children.push(child)
      } else if (child.type === 'rule' && bubbling) {
        child.selectors = selectors(rule, child)
      } else if (child.type === 'atrule') {
        if (child.nodes && bubble[child.name]) {
          atruleChilds(rule, child, true)
        } else {
          children.push(child)
        }
      }
    })
    if (bubbling) {
      if (children.length) {
        let clone = rule.clone({ nodes: [] })
        for (let child of children) {
          clone.append(child)
        }
        atrule.prepend(clone)
      }
    }
  }
}

function pickDeclarations (selector, declarations, after, Rule) {
  let parent = new Rule({
    selector,
    nodes: []
  })

  for (let declaration of declarations) {
    parent.append(declaration)
  }

  after.after(parent)
  return parent
}

function atruleNames (defaults, custom) {
  let list = {}
  for (let i of defaults) {
    list[i] = true
  }
  if (custom) {
    for (let i of custom) {
      let name = i.replace(/^@/, '')
      list[name] = true
    }
  }
  return list
}

module.exports = (opts = {}) => {
  let bubble = atruleNames(['media', 'supports'], opts.bubble)
  let atruleChilds = createFnAtruleChilds(bubble)
  let unwrap = atruleNames(
    [
      'document',
      'font-face',
      'keyframes',
      '-webkit-keyframes',
      '-moz-keyframes'
    ],
    opts.unwrap
  )
  let preserveEmpty = opts.preserveEmpty

  return {
    postcssPlugin: 'postcss-nested',
    Rule (rule, { Rule }) {
      let unwrapped = false
      let after = rule
      let copyDeclarations = false
      let declarations = []

      rule.each(child => {
        if (child.type === 'rule') {
          if (declarations.length) {
            after = pickDeclarations(rule.selector, declarations, after, Rule)
            declarations = []
          }

          copyDeclarations = true
          unwrapped = true
          child.selectors = selectors(rule, child)
          after = pickComment(child.prev(), after)
          after.after(child)
          after = child
        } else if (child.type === 'atrule') {
          if (declarations.length) {
            after = pickDeclarations(rule.selector, declarations, after, Rule)
            declarations = []
          }

          if (child.name === 'at-root') {
            unwrapped = true
            atruleChilds(rule, child, false)

            let nodes = child.nodes
            if (child.params) {
              nodes = new Rule({ selector: child.params, nodes })
            }

            after.after(nodes)
            after = nodes
            child.remove()
          } else if (bubble[child.name]) {
            copyDeclarations = true
            unwrapped = true
            atruleChilds(rule, child, true)
            after = pickComment(child.prev(), after)
            after.after(child)
            after = child
          } else if (unwrap[child.name]) {
            copyDeclarations = true
            unwrapped = true
            atruleChilds(rule, child, false)
            after = pickComment(child.prev(), after)
            after.after(child)
            after = child
          } else if (copyDeclarations) {
            declarations.push(child)
          }
        } else if (child.type === 'decl' && copyDeclarations) {
          declarations.push(child)
        }
      })

      if (declarations.length) {
        after = pickDeclarations(rule.selector, declarations, after, Rule)
      }

      if (unwrapped && preserveEmpty !== true) {
        rule.raws.semicolon = true
        if (rule.nodes.length === 0) rule.remove()
      }
    }
  }
}
module.exports.postcss = true
