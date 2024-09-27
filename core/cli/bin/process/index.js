const cp = require('child_process')
const path = require('path')
// exec、execFile：马上返回结果
// cp.exec('dir', function (err, stdout, stderr) {
//   console.log(err)
//   console.log(stdout)
//   console.log(stderr)
// })

// spawn: 耗时任务，需要不断日志
// const child = cp.spawn('npm', ['install'], {
//   cwd: path.resolve('D:/D:/vue-code/xmx-cli-dev/')
// })

// child.stdout.on('data', function (chunk) {
//   console.log(chunk.toString())
// })

// child.stderr.on('data', function (chunk) {
//   console.log(chunk.toString())
// })

// fork:Node
const child = cp.fork(path.resolve(__dirname, 'child.js'))
child.send('hello child process!')
child.on('message', msg => {
  console.log(msg)
})
console.log('main pid:', process.pid)
