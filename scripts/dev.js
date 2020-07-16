/*
Run Rollup in watch mode for development.

To specific the package to watch, simply pass its name and the desired build
formats to watch (defaults to "global"):

```
# name supports fuzzy match. will watch all packages with name containing "dom"
yarn dev dom

# specify the format to output
yarn dev core --formats cjs

# Can also drop all __DEV__ blocks with:
__DEV__=false yarn dev
```
*/

const execa = require('execa')
const { fuzzyMatchTarget } = require('./utils')
// 解析命令行参数输出一个对象
const args = require('minimist')(process.argv.slice(2))
// args._是一个数组，包含未指定参数名的变量。
// 如 // node scripts/dev.js template-explorer args._ 为['template-explorer']
// target是packages目录下的符合条件的目录名
const target = args._.length ? fuzzyMatchTarget(args._)[0] : 'vue'
const formats = args.formats || args.f
const sourceMap = args.sourcemap || args.s
// 截取前7位作为commit id
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

// 终端命令：rollup -wc --environment COMMIT:{commit},TARGET:{target},FORMATS:{formats},SOURCE_MAP:true?
// -w watch file change
// -c 通过配置文件配置，不设置配置文件则是默认的rollup.config.js
// --environment <values> 将额外的变量传入配置文件中，通过process.env.XXX 读取
// https://rollupjs.org/guide/en/#command-line-flags
execa(
  'rollup',
  [
    '-wc',
    '--environment',
    [
      `COMMIT:${commit}`,
      `TARGET:${target}`,
      `FORMATS:${formats || 'global'}`,
      sourceMap ? `SOURCE_MAP:true` : ``
    ]
      .filter(Boolean) // 过滤掉假的值。Boolean将接收到的第一个参数转为boolean类型值
      .join(',')
  ],
  {
    stdio: 'inherit' // https://nodejs.org/api/child_process.html#child_process_options_stdio TODO 还不清楚
  }
)
