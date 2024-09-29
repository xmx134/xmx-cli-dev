const request = require('@xmx-cli-dev/request')

module.exports = function () {
  return request({
    url: '/project/template'
  })
}
