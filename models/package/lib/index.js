'use strict'

const path = require('path')
const pkgDir = require('pkg-dir').sync
const fse = require('fs-extra')
const npminstall = require('npminstall')
const pathExists = require('path-exists').sync
const { isObject } = require('@xmx-cli-dev/utils')
const formatPath = require('@xmx-cli-dev/format-path')
const { getDefaultRegistry, getNpmLatestVersion } = require('@xmx-cli-dev/get-npm-info')

// 动态命令抽象成package类，实现init后面可以跟随所有动态指令。
// 包括vue、react等
// package内功能有：
// 支持本地路径查询，可以查找包的下载位置是否已经存在包，
// 可以从npm线上库中下载包的install方法
// 支持本地包版本判断
// 可以在本地包的基础路径上更新包的update功能
// 如果包的版本已经是最高了，就不做任何操作
class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类的options参数不能为空！')
    }
    if (!isObject(options)) {
      throw new Error('Package类的options参数必须为对象！')
    }
    // package的路径
    this.targetPath = options.targetPath
    // 缓存package的路径
    this.storeDir = options.storeDir
    // package的name
    this.packageName = options.packageName
    // package的version
    this.packageVersion = options.packageVersion
    // package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '+')
  }

  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir)
    }
    // 转化packageVersion，获取最新版本的版本号
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, '.store', `${this.cacheFilePathPrefix}@${this.packageVersion}`)
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, '.store', `${this.cacheFilePathPrefix}@${packageVersion}`)
  }

  //   判断当前Package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }
  //   安装Package
  async install() {
    await this.prepare()
    // npminstall是promise队列
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion
        }
      ]
    })
  }
  // 更新Package
  async update() {
    await this.prepare()
    // 1、获取最新的npm模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName)
    // 2、查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion)
    // 3、如果不存在，则直接安装最新版本
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion
          }
        ]
      })
      //   更新版本号
      this.packageVersion = latestPackageVersion
    }
    this.packageVersion = latestPackageVersion
  }

  // 获取入口文件路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      // 1.获取package.json所在的目录 - pkg-dir
      // pkg-dir包在 Node.js 项目中非常实用，可以帮助开发者快速确定项目根目录，
      // 从而更方便地进行文件路径构建和资源访问等操作。
      const dir = pkgDir(targetPath)
      if (dir) {
        // 2.读取package.json - require()
        const pkgFile = require(path.resolve(dir, 'package.json'))
        // 3.寻找main/lib - path
        if (pkgFile && pkgFile.main) {
          // 4.路径的兼容（macOS/windows）
          return formatPath(path.resolve(dir, pkgFile.main))
        }
      }
      return null
    }
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package
