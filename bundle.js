const fs = require('fs')
var MagicString = require('magic-string');
const path = require('path')
const  Module  = require('./module');
class Bundle {
  constructor(options) {
    this.entryPath = options.entry.replace(/\.js$/, '') + '.js'
    //各个模块入口文件和它的依赖模块
    this.modules = {}
  }

  build(outputFileName) {
    //找到模块定义
    let entryModule = this.fetchModule(this.entryPath)
    //把入口模块所有的语句进行展开,返回所有语句组成的数组
    this.statements = entryModule.expandAllStatements()
    const { code } = this.generate()
    fs.writeFileSync(outputFileName, code, 'utf8')
  }

  generate() {
    let magicString =new MagicString.Bundle()
    //1 遍历模块
    this.statements.forEach(statement => {
      //删除掉export
      
      const source = statement._source
      if (statement.type === 'ExportNamedDeclaration') {
        console.log(statement);
        source.remove(statement.start, statement.declaration.start)
      }
      //2 合并
      magicString.addSource({
        content: source,
        separator: '\n'
      })
    })
    //3 返回
    return { code: magicString.toString() }
  }
  fetchModule(importee, importer) {
    // 1 entry路径 读文件
    let route;
    if (!importer) {
      route = importee
    } else {
      if (path.isAbsolute(importee)) {
        route = importee
      } else if (importee[0] == '.') {
        route = path.resolve(path.dirname(importer), importee.replace(/\.js$/, '') + '.js')
      }
    }
    if (route) {
      let code = fs.readFileSync(route, 'utf8')
      let module = new Module(
        {
          code:code,
          path: route,
          bundle: this  //属于哪个bundle
        }
      )
      // 2 模块
      return module
    }
  }

}
module.exports=Bundle

