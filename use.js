const path = require('path')
const rollup = require('./rollup')
// 入口文件的绝对路径
let entry = path.resolve(__dirname, './src/main')
// 和源码有所不同，这里使用的是同步，增加可读性
console.log('~~~~~~~~~',entry);
rollup(entry, './src/bundle.js')
