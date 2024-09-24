#! /usr/bin/env node

// 保存此文档供后续写笔记用，记录一个最简化的脚手架开发流程
const dedent = require('dedent')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { demandCommand, describe } = require('yargs')
const pkg = require('../package.json')

const arg = hideBin(process.argv)
const cli = yargs()
const argv = process.argv.slice(2)

const context = {
  lernaVersion: pkg.version
}

// const cli = yargs(argv, cwd)
// usage 项目介绍
// demandCommand 最少需要输入的命令
// strict 严格模式，会对错误指令进行报错
// options 对全局加命令，支持列表形式
// option 对全局加命令，支持单个对象形式
// recommendCommands 对输入错误的指令，提供近似命令进行提示
// group 生成选项组的形式，对选项进行分组
// command 生成指令，支持对象形式传入
// 自定义报错信息
yargs(arg)
  .usage(`Usage: $0 [command] <options>`)
  .demandCommand(1, 'A command is required. Pass --help to see all available commands and options.')
  .strict()
  .recommendCommands()
  .fail((err, msg) => {
    console.log(err)
  })
  .alias('h', 'help')
  .alias('v', 'version')
  .wrap(cli.terminalWidth())
  .epilogue(
    dedent`
    your first cli
  `
  )
  .options({
    debug: {
      type: 'boolean',
      describe: 'Bootstrap debug mode',
      alias: 'd'
    },
    xMode: {
      type: 'boolean',
      describe: 'Bootstrap x mode',
      alias: 'x'
    }
  })
  .option('registry', {
    describe: 'Define global registry',
    alias: 'r'
    // hidden: true // hidden隐藏指令
  })
  .group(['debug', 'xMode'], '开发选项:')
  .group(['registry'], '额外选项:')
  .command({
    command: 'init [name]',
    describe: 'Do init a project',
    // builder 预处理逻辑
    builder: yargs => {
      yargs.option('name', {
        type: 'string',
        describe: 'Name of a project',
        alias: 'n'
      })
    },
    // handler 实际调用逻辑
    handler: argv => {
      console.log(argv)
    }
  })
  .command({
    command: 'list',
    aliases: ['ls', 'la', 'll'],
    describe: 'List local packages',
    builder: yargs => {},
    handler: argv => {
      console.log(argv)
    }
  })
  .parse(argv, context)
