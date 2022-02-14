import MagicString from "magic-string"
import { parse } from "path/posix";

class Module {
  constructor({ code, path, bundle }) {
    this.code = new MagicString(code, { filename: path })
    this.path = path;
    this.bundle = bundle
    this.ast = parse(code, { ecmaVersion, sourceType: 'module' })
    this.analyse()
  }
  analyse() { }
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
    return result;
  }
  //找到定义这个变量声明的节点  (在当前模块 or 在 导入模块)
  define(name) {
    if(hasOwnProperty(this.imports,name)) {
      const importData=this.imports[name]
    }
    return [];
  }
}
export default Module