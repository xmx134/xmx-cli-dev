console.log('child')
// 子进程id和processId不相同
console.log('child pid:', process.pid)

process.on('message', msg => {
  console.log(msg)
  process.disconnect()
})

process.send('hello, process!')
