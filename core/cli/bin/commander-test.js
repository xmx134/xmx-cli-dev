#!/usr/bin/env node

// 测试编写commander

const commander = require('commander')
const pkg = require('../package.json')

// 获取commander的单例
// const { program } = commander

// 手动实例化一个Command实例
const program = new commander.Command()

program
  .name(Object.keys(pkg.bin)[0])
  .usage('<command> [options]')
  .version(pkg.version)
  .option('-d, --debug', '是否开启调试模式', false)
  .option('-e,--env <envName>', '获取环境变量名称')

//   command 注册命令
const clone = program
  .command('clone <source> [destination]')
  .option('-f, --force', '是否强制克隆')
  .description('clone a repository into a newly created directory')
  .action((source, destination, comObj) => {
    console.log(`clone command called by ${source}, for ${destination}`, comObj.force)
  })

// addCommand 注册子命令
// 注意事项，每个command只能单独注册
// addCommand 相当于注册了一个command分组，将command小组绑定在主脚手架program上，
const service = new commander.Command('service')
service
  .command('start [port]')
  .description('start service at some port')
  .action(port => {
    console.log('do service start', port)
  })

service
  .command('stop [port]')
  .description('stop service')
  .action(() => {
    console.log('stop service')
  })

program.addCommand(service)

// 直接注册在program上的command，会拼接到主指令后，生成一个新的指令
program
  .command('install [name]', 'install package', {
    executableFile: 'xmx-install', // 修改命令执行指令为xmx-install指令
    isDefault: false, // 指定为脚手架默认命令
    hidden: false // 隐藏命令在help上的展示
  })
  .alias('i')
// 测试拼接指令
program.command('test', 'test for line').alias('t')

// 强制用户输入<cmd>命令，如果匹配不到<cmd>命令就会报错
// 类似于Yargs中的demandCommand api
// TODO，找到description的替代api
// program
//   .arguments('<cmd> [options]')
//   .description('test command', {
//     cmd: 'command to run',
//     options: 'options for command'
//   })
//   .action(function (cmd, options) {
//     console.log(cmd, options)
//   })

//   高级定制1，自定义help信息
// program.helpInformation = function () {
//   return ''
// }
// EventEmitter
// 监听options来修改
// program.on('--help', function () {
//   console.log('your help information')
// })

// 高级定制2，实现debug模式
program.on('option:debug', function () {
  if (program._optionValues.debug) {
    process.env.LOG_LEVEL = 'verbose'
  }
  console.log(process.env.LOG_LEVEL)
})

// 高级定制3，对未知命令监听
program.on('command:*', function (object) {
  console.log('object :>> ', object)
  console.error('未知的命令：' + object[0])
  const availableCommands = program.commands.map(cmd => cmd.name())
  console.log('可用命令：' + availableCommands.join(','))
})

program.parse(process.argv)
