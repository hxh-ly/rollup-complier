const MagicString = require('magic-string')
const analyse = require('./ast/analyse')
let {parse} = require("acorn");
//this.imports 
//this.exports
class Module {
  constructor({ code, path, bundle }) {
    this.code = new MagicString(code, { filename: path })
    this.path = path;
    this.bundle = bundle
    this.ast = parse(code, { ecmaVersion:7, sourceType: 'module' })
    this.imports = {} // 导入的变量
    /* 
    {
      import[name]:{source,localName,name}
    }
    */
    this.exports = {} // 导出的变量
    /* 
    {
      export[name] :{node,localName,expression}
    } 
    */
    this.definitions = {} // 变量定义的语句
    this.analyse()
  }
  analyse() {
    //收集导入变量
    this.ast.body.forEach(node => {
      if (node.type === 'ImportDeclaration') {
        const source = node.source.value
        node.specifiers.forEach(specifier => {
          const { name: localName} = specifier.local
          const { name } = specifier.imported
          this.imports[localName] = {
            source,
            name,
            localName,
          }
        })
      }
      //收集导出变量
      else if (node.type === 'ExportNamedDeclaration') {
        const { declaration } = node
        if (declaration.type === 'VariableDeclaration') {
          const { name } = declaration.declarations[0].id
          this.exports[name] = {
            node,
            localName: name,
            expression: declaration,
          }
        }
      }
    })
    analyse(this.ast, this.code, this)
    //变量与声明语句 definitions
    this.ast.body.forEach(statement => {
      //_defines:本模块全部全局变量
      Object.keys(statement._defines).forEach(name => {
        this.definitions[name] = statement
      })
    })
  }
  /* 找到当前节点依赖的变量,找到这些变量的声明语句 (在当前模块声明 or 在导入模块声明 ) */
  expandStatement(statement) {
    let result = [];
    //_dependsOn当前模块没有定义但是使用到的变量
    const dependencies = Object.keys(statement._dependsOn)

    // 当前 依赖的节点列表
    dependencies.forEach(name => {
      let definition = this.define(name)
      result.push(...definition)
    })
    if (!statement._included) {
      statement._included = true;
      result.push(statement)
    }
    //返回 （依赖的和自己） node
    return result;
  }
  //找到定义这个变量声明的语句  (在当前模块 or 在 导入模块)
  define(name) {
    //在自己模块里面找
    if (Object.hasOwnProperty(this.imports, name)) {
      const importData = this.imports[name]
      //获取导入变量的模块
      const module = this.bundle.fetchModule(importData.source, this.path)
      //这个 module模块也有 导入导出
      const exportData = module.exports[importData.name]
      if (!exportData) {
        throw new Error(`Module ${mod.path} does not export ${importData.name} (imported by ${this.path})`)
      }
      //返回 这个导入模块变量的声明语句
      return module.define(exportData.localName)
    } else {
      //definitions存当前模块全局定义语句 ----> _defines
      //definitions是对象，当前模块的变量名,值是定义这个变量的语句
      let statement = this.definitions[name]
      if (statement && !statement._included) {
        return this.expandStatement(statement)
      } else {
        return [];
      }
    }
  }
    //当前模块的所有语句，把这些语句中定义的变量的语句都放在结果里
    expandAllStatements() {
      let allStatements=[]
      this.ast.body.forEach(statement=>{
        if(statement.type === 'ImportDeclaration') {return}
        let statements = this.expandStatement(statement)
        allStatements.push(...statements)
      })
      return allStatements
    }
}
module.exports = Module
