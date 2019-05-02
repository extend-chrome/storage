/* eslint-env node */

// module.exports = api => {
//   const isTest = api.env('test')
//   // You can use isTest to determine what presets and plugins to use.

//   return {
//     // ...
//   }
// }

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: 70,
        },
      },
    ],
  ],
  sourceMaps: 'inline',
  retainLines: true,
}
