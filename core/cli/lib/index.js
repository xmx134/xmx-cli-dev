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
const npm = require('@xmx-cli-dev/npm')
const init = require('@xmx-cli-dev/init')

const colors = require('colors/safe')
const semver = require('semver')
const constant = require('./const')
const userHome = require('user-home')
const fs = require('fs')
const path = require('path')
const pathExists = require('path-exists')
const commander = require('commander')
const packageConfig = require('../package.json')

const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME, NPM_NAME, DEPENDENCIES_PATH } = require('./const')

let args
let config

const program = new commander.Command()

async function core() {
  try {
    checkPkgVersion() // 检查当前运行版本
    checkNodeVersion() // 检查 node 版本
    checkRoot() // 检查是否为 root 启动
    checkUserHome() // 检查用户主目录
    // checkInputArgs() // 检查用户输入参数 功能迁移到registerCommand中，监听debug功能
    checkEnv() // 检查环境变量
    await checkGlobalUpdate() // 检查工具是否需要更新
    registerCommand()
  } catch (e) {
    log.error(e.message)
  }
}

function registerCommand() {
  program.name(Object.keys(pkg.bin)[0]).usage('<command> [options]').version(pkg.version).option('-d --debug', '是否开启调试模式', false)

  program.command('init [projectName]').option('-f,--force', '是否强制初始化').action(init)

  // 开启debug模式
  program.on('option:debug', function () {
    if (program._optionValues.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  // 对未知命令进行监听
  program.on('command:*', function (obj) {
    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log(colors.red(`未知的命令${obj[0]}`))
    if (availableCommands.length > 0) {
      console.log(colors.red(`可用命令：${availableCommands.join(',')}`))
    }
  })

  // 无法判断是否是空指令，因为options和command都会进入process.argv里面
  // if (process.argv.length < 3) {
  //   program.outputHelp()
  //   console.log()
  // }

  program.parse(process.argv)

  // 通过program.parse对参数解析后，command进入program.args中，这时判断空指令更加准确
  if (program.args && program.args.length < 1) {
    program.outputHelp()
    console.log()
  }
}

async function checkGlobalUpdate() {
  log.verbose('检查 xmx-cli 最新版本')
  const currentVersion = packageConfig.version
  const npmName = pkg.name
  const versions = await npm.getNpmVersions(npmName)
  const lastVersion = await npm.getNpmLatestSemverVersion(npmName, currentVersion)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      '更新提示',
      colors.yellow(`请手动更新 ${NPM_NAME}，当前版本${currentVersion}，最新版本：${lastVersion}
                  更新目录： npm install -g ${NPM_NAME}`)
    )
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
