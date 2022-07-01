'use strict';

const { runTransformTest } = require('codemod-cli');

runTransformTest({
  name: 'should-to-assert',
  path: require.resolve('./index.js'),
  fixtureDir: `${__dirname}/__testfixtures__/`,
});
