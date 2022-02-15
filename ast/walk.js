function walk(node, { enter, leave }) {
  visit(node, null, enter, leave)
}
function visit(node, parent, enter, leave) {
  if (enter) {
    enter.call(null, node, parent)
  }
  const keys = Object.keys(node).filter(key => typeof node[key] === 'object')
  /* 
      "declarations": [
        {
          "type": "VariableDeclarator",
          "start": 209,
          "end": 216,
          "id": {
            "type": "Identifier",
            "start": 209,
            "end": 212,
            "name": "meg"
          },
          "init": {
            "type": "Literal",
            "start": 213,
            "end": 216,
            "value": "z",
            "raw": "'z'"
          }
        }
      ],
  */
  keys.forEach(key => {
    const value = node[key]
    if (Array.isArray(value)) {
      value.forEach(val => {
        visit(val, node, enter, leave)
      })
    } else if (value && value.type) {
      visit(value, node, enter, leave)
    }
  })
  if (leave) {
    leave.call(null, node, parent)
  }
}
module.exports = walk