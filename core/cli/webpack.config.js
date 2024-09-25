const path = require('path')
module.exports = {
  entry: './bin/esmode.js',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index.js'
  },
  mode: 'production'
}
