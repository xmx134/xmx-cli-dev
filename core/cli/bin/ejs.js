const ejs = require('ejs')
const path = require('path')

const html = '<div><%= user.name %></div>'
const options = {}
const data = {
  user: {
    name: 'xmx'
  }
}

const data2 = {
  user: {
    name: 'ywm'
  }
}

// 返回function，用于解析html中的ejs模板
let template = ejs.compile(html, options)
const compileTemplate = template(data)
const compileTemplate2 = template(data2)

console.log(compileTemplate)
console.log(compileTemplate2)

const renderTemplate = ejs.render(html, data, options)
console.log(renderTemplate)

const renderFile = ejs.renderFile(path.resolve(__dirname, 'template.html'), data, options)
renderFile.then(file => console.log(file))

ejs.renderFile(path.resolve(__dirname, 'template.html'), data, options, (err, file) => {
  console.log(file)
})
