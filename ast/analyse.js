import Scope from "./Scope";
//分析每个AST节点之间的作用域,构建scope tree
function analyse(ast, magicString, module) {
  let scope = new Scope() //先创建一个模块内的全局作用域
  //遍历当前的所有的语法树的所有顶级节点
  ast.body.forEach(statement => {
    //被作用域添加变量 var function const let
    function addToScope(declarations) {
      var name = declarations.id.name;//获得这个声明的变量
      scope.add(name)
      if (!scope.parent) { //如果当前是全局作用域的话
        statement._defines[name] = true
      }
    }
    Object.defineProperty(statement, {
      _defines: { values: {} }, //当前模块定义中的所有全局变量
      _dependsOn: { value: {} },  //当前模块没有定义但是使用到的变量
      _included: { value: false, writable: true },//此语句是否已经 被包含到打包结果中
      _source: { value: magicString.snip(statement.start, statement.end) }
    })


  })

  this.definitions = {};//存放着所有的全局变量的定义语句
  this.ast.body.forEach(statement => {
    Object.keys(statement._defines).forEach(name => {
      //key 是全局变量名，值是定义这个全局变量的语句
      this.definitions[name] = statement;
    });
  });

}
export default analyse