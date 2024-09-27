'use strict'

const Command = require('@xmx-cli-dev/command')
const log = require('@xmx-cli-dev/log')

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.force = !this._cmd.force
    log.verbose(this.projectName)
    log.verbose(this.force)
  }
  exec() {
    console.log('init的业务逻辑')
  }
}

function init(...argv) {
  return new InitCommand(argv)
}

module.exports = init
module.exports.InitCommand = InitCommand
