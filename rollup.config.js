/* eslint-env node */

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'lib/index-esm.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'lib/index-cjs.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    external: [
      'chrome-promise',
      '@extend-chrome/events-rxjs',
      'rxjs/operators',
    ],
  },
]
