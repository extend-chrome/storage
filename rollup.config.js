/* eslint-env node */

import typescript from '@rollup/plugin-typescript'

const { dependencies } = require('./package.json')

const external = Object.keys(dependencies).concat(
  'rxjs/operators',
)

const plugins = [typescript()]

export default [
  {
    input: 'src/index.ts',
    output: outputs('lib/index'),
    external,
    plugins,
  },
  {
    input: 'src/jest-mock.ts',
    output: outputs('jest/jest-mock'),
    external,
    plugins,
  },
  // {
  //   input: 'src/react-hooks.ts',
  //   output: outputs('hooks/react-hooks'),
  //   external,
  //   plugins,
  // },
]

function outputs(filepathStem) {
  return [
    {
      file: filepathStem + '-esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: filepathStem + '-cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
  ]
}
