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
// 项目如果会卡的话，基本上就是源这里出了问题，只有这里需要调用远程接口。
function getDefaultRegistry(isOriginal = false) {
  // 淘宝源总是显示证书过期，替换成腾讯云镜像
  return isOriginal ? 'https://registry.npmjs.org' : 'https://mirrors.cloud.tencent.com/npm/'
}

// 获取某个 npm 的最新版本号
async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry)
  if (versions) {
    // TODO 似乎这个排序不生效
    // return versions.sort((a, b) => (semver.gt(a, b) ? 1 : -1))[versions.length - 1]
    return versions[versions.length - 1]
  }
  return null
  // return getNpmInfo(npm, registry).then(function (data) {
  //   if (!data['dist-tags'] || !data['dist-tags'.latest]) {
  //     console.error('没有 latest 版本号', data)
  //     return Promise.reject(new Error('Error: 没有 latest 版本号'))
  //   }
  //   const latestVersion = data['dist-tags'].latest
  //   return latestVersion
  // })
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
  versions = versions.filter(version => semver.satisfies(version, `^ ${baseVersion}`)).sort((a, b) => (semver.gt(b, a) ? 1 : -1))
  return versions[0]
}

// 根据指定 version 和包名获取符合 semver 规范的最新版本号
async function getNpmLatestSemverVersion(npmName, baseVersion, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const newVersions = getLatestSemverVersion(baseVersion, versions)
  if (newVersions && newVersions.length > 0) {
    return newVersions
  }
}

module.exports = {
  getDefaultRegistry,
  getNpmInfo,
  getNpmLatestVersion,
  getNpmLatestSemverVersion,
  getNpmVersions
}
