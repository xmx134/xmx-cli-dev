'use strict'

const path = require('path')
const cp = require('child_process')
const Package = require('@xmx-cli-dev/package')
const log = require('@xmx-cli-dev/log')

const SETTINGS = {
  init: '@xmx-cli-dev/init'
}

const CACHE_DIR = 'dependencies'

// 如何处理动态方法的参数管理：动态方法的参数通过全局参数传递
async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  let storeDir = ''
  let pkg

  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)

  const cmdObj = arguments[arguments.length - 1]
  const cmdName = cmdObj.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR) // 生成缓存路径
    log.verbose('targetPath', targetPath)
    storeDir = path.resolve(targetPath, 'node_modules') // 找到node_modules的保存路径
    log.verbose('storeDir', storeDir)
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion
    })

    if (await pkg.exists()) {
      //  更新 package
      await pkg.update()
    } else {
      // 安装 package
      await pkg.install()
    }

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion
    })
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    })
  }
  const rootFile = pkg.getRootFilePath()
  if (rootFile) {
    try {
      // require(rootFile)获取的是init方法
      // apply 方法可以将数组列表转换成参数列表的形式
      // require(rootFile).apply(null, Array.from(arguments))
      // 通过node子进程实现
      const args = Array.from(arguments)
      const cmd = args[args.length - 1]
      const o = Object.create(null)
      Object.keys(cmd).forEach(key => {
        if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
          o[key] = cmd[key]
        }
      })
      args[args.length - 1] = o
      const code = `require('${rootFile}').call(null,${JSON.stringify(args)})`
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit'
      })
      child.on('error', e => {
        log.error(e.message)
        process.exit(1)
      })
      child.on('exit', e => {
        log.verbose('命令执行成功：' + e)
        process.exit(e)
      })
    } catch (error) {
      log.error(error.message)
    }
  }
}

function spawn(command, args, options) {
  const win32 = process.platform === 'win32'

  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args
  return cp.spawn(cmd, cmdArgs, options || {})
}

module.exports = exec
