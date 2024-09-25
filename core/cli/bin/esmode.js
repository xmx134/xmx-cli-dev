#!/usr/bin/env node

// 如何让Node支持ES Modlue
// 模块化
// CMD/AMD/require.js

// CommonJS
// 加载：require()
// 输出：module.exports / exports.x

// ES Module
// 加载：import
// 输出：export default / export function/const

import path from 'path'
import { exists } from './utils'

console.log(path.resolve)
console.log(exists(path.resolve('.')))
