const semver = require('semver')
const axios = require('axios')
const urlJoin = require('url-join')

// 从 registry 获取 npm 的信息
function getNpmInfo(npmName, registryName) {
  if (!npmName) {
    return null
  }
  const registry = registryName || getDefaultRegistry()
  const npmInfoUrl = urlJoin(registry, npmName)
  console.log(npmInfoUrl)
  return axios.get(npmInfoUrl).then(function (response) {
    try {
      if (response.status === 200) {
        return response.data
      }
    } catch (error) {
      return Promise.reject(error)
    }
  })
}

// 获取 registry 信息
function getDefaultRegistry(isOriginal = true) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

// 获取某个 npm 的最新版本号
function getLatestVersion(npm, registry) {
  return getNpmInfo(npm, registry).then(function (data) {
    if (!data['dist-tags'] || !data['dist-tags'.latest]) {
      console.error('没有 latest 版本号', data)
      return Promise.reject(new Error('Error: 没有 latest 版本号'))
    }
    const latestVersion = data['dist-tags'].latest
    return latestVersion
  })
}

// 获取某个 npm 的所有版本号
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (data) {
    return Object.keys(data.versions)
  } else {
    return []
  }
}

// 根据指定 version 获取符合 semver 规范的最新版本号
function getLatestSemverVersion(baseVersion, versions) {
  versions = versions.filter(version => semver.satisfies(version, `^ ${baseVersion}`)).sort((a, b) => semver.gt(b, a))
  return versions[0]
}

// 根据指定 version 和包名获取符合 semver 规范的最新版本号
async function getNpmLatestSemverVersion(npmName, baseVersion, registry) {
  const versions = await getNpmVersions(npmName, registry)
  console.log(versions, 'versions')
  const newVersions = getLatestSemverVersion(baseVersion, versions)
  if (newVersions && newVersions.length > 0) {
    return newVersions
  }
}

module.exports = {
  getDefaultRegistry,
  getNpmInfo,
  getLatestVersion,
  getNpmLatestSemverVersion,
  getNpmVersions
}
