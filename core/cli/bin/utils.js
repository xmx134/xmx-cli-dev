import { pathExists } from 'path-exists'

// TODO 了解path-exists文件包
export function exists(p) {
  return pathExists.sync(p)
}
