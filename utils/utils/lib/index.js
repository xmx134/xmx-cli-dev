'use strict'

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function spinnerStart(msg, spinnerString = '|/-\\') {
  const Spinner = require('cli-spinner').Spinner

  const spinner = new Spinner(msg + ' %s')
  spinner.setSpinnerString(spinnerString)
  spinner.start()
  return spinner
}

function sleep(timeout = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

function exec(command, args, options) {
  const win32 = process.platform == 'win32'

  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args

  return require('child_process').spawn(cmd, cmdArgs, options || {})
}

// 以Promise的形式来开子进程执行命令编译
function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const p = exec(command, args, options)
    p.on('error', e => {
      reject(e)
    })
    p.on('exit', c => {
      resolve(c)
    })
  })
}

module.exports = { isObject, spinnerStart, sleep, exec, execAsync }
