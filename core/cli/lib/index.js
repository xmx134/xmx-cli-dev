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

const colors = require('colors/safe')
const semver = require('semver')
const constant = require('./const')
const userHome = require('user-home')
const fs = require('fs')
const path = require('path')
const pathExists = require('path-exists')

const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME, NPM_NAME, DEPENDENCIES_PATH } = require('./const')

let args
let config

function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    checkInputArgs()
    checkEnv()
  } catch (e) {
    log.error(e.message)
  }
}

function checkEnv() {
  log.info(userHome)
  log.verbose('开始检查环境变量')
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath
    })
  }
  createCliConfig()
  log.verbose('环境变量', config)
}

function createCliConfig() {
  const cliConfig = {
    home: userHome
  }

  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

function checkInputArgs() {
  log.verbose('开始校验输入参数')
  const minimist = require('minimist')
  args = minimist(process.argv.slice(2))
  checkArgs(args)
  log.verbose('输入参数', args)
}

function checkArgs(args) {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  log.level = process.env.LOG_LEVEL
}

function checkUserHome() {
  if (!userHome || !fs.existsSync(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
}

function checkRoot() {
  const rootCheck = require('root-check')
  rootCheck()
}

function checkNodeVersion() {
  const currentVersion = process.version
  const lowestVersion = constant.LOWEST_NODE_VERSION

  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`imooc-cli 需要安装v${lowestVersion} 以上版本的 Node.js`))
  }
}

function checkPkgVersion() {
  log.notice('cli', pkg.version)
}
