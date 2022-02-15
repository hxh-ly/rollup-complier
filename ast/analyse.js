const Scope = require("./Scope");
const walk = require("./walk");
//分析每个AST节点之间的作用域,构建scope tree
function analyse(ast, magicString, module) {
  let scope = new Scope() //先创建一个模块内的全局作用域
  //遍历当前的所有的语法树的所有顶级节点
  ast.body.forEach(statement => {
    //被作用域添加变量 var function const let
    function addToScope(declarations) {
      var name = declarations.id.name;//获得这个声明的变量
      scope.add(name)
      if (!scope.parent) { //如果是模块内顶级作用域
        statement._defines[name] = true
      }
    }
    Object.defineProperties(statement, {
      _source: { // 源代码
        configurable: true,
        value: magicString.snip(statement.start, statement.end),
      },
      _defines: { // 当前模块定义的变量
        configurable: true,
        value: {},
      },
      _dependsOn: { // 当前模块没有定义的变量，即外部依赖的变量
        configurable: true,
        value: {},
      },
      _included: { // 是否已经包含在输出语句中
        configurable: true,
        value: false,
        writable: true,
      },
    })
    //构建模块的作用域链
    walk(statement, {
      enter(node) {
        let newScope
        switch (node.type) {
          case 'FunctionDeclaration':
            //形参
            const params = node.params.map(p => p.name)
            addToScope(node) //往Scope加名字 构建_defines
            newScope = new Scope({
              parent: scope,
              params,
            })
            break;
          case 'VariableDeclaration':
            node.declarations.forEach(addToScope); break;
        }
        if (newScope) {
          Object.defineProperty(node, '_scope', {
            value: newScope,
          })
          //进去当前的作用域就要变了
          scope = newScope
        }
      },
      leave(node) {
        if (node._scope) {
          scope = scope.parent
        }
      }
    }
    )
  })
  ast._scope = scope
  //收集外部依赖的变量
  ast.body.forEach(statement => {
    walk(statement, {
      enter(node) {
        if (node.type === 'Identifier') {
          const { name } = node;
          const definingScope = scope.findDefiningScope(name)
          //找不到作用域链找不到,说明在外部依赖
          if (!definingScope) {
            statement._dependsOn[name] = true
          }
        }
      }
    })
  })
  /*  this.definitions = {};//存放着所有的全局变量的定义语句
   this.ast.body.forEach(statement => {
     Object.keys(statement._defines).forEach(name => {
       //key 是全局变量名，值是定义这个全局变量的语句
       this.definitions[name] = statement;
     });
   }); */

}
module.exports = analyse