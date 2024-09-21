'use strict'

module.exports = core

// require: .js/.json/.node
// .js → module.exports/exports
// .json → JSON.parse
// any → .js 全部其他类型的文件当做js文件来解析
const pkg = require('../package.json')

// 新模块引用流程：在package.json文件下添加模块依赖
// 在当前模块包下执行npm link，链接本地文件
// 在当前模块包下执行npm i，安装对应依赖
const log = require('@xmx-cli-dev/log')

log()

function core() {
  checkPkgVersion()
}

function checkPkgVersion() {
  console.log(pkg.version)
}
