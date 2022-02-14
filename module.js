import MagicString from "magic-string"
import { parse } from "path/posix";
//this.imports 
//this.exports
class Module {
  constructor({ code, path, bundle }) {
    this.code = new MagicString(code, { filename: path })
    this.path = path;
    this.bundle = bundle
    this.ast = parse(code, { ecmaVersion, sourceType: 'module' })
    this.analyse()
  }
  analyse() {
    this.analyse(this.ast, this.code, this)
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
    if (hasOwnProperty(this.imports, name)) {
      const importData = this.imports[name]
      //获取导入变量的模块
      const module = this.bundle.fetchModule(importData.source, this.path)
      //这个 module模块也有 导入导出
      const exportData = module.exports[importData.name]
      //返回 这个导入模块变量的声明语句
      return module.define(exportData.localName)
    } else {
      //definitions存当前模块全局定义语句 ----> _defines
      //definitions是对象，当前模块的变量名,值是定义这个变量的语句
      let statement = this.definition[name]
      if (statement && !statement._included) {
        return this.expandStatement(statement)
      } else {
        return [];
      }
    }
  }
}
export default Module