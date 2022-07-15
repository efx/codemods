'use strict';

const { runTransformTest } = require('codemod-cli');

runTransformTest({
  name: 'mocha-to-qunit-patch',
  path: require.resolve('./index.js'),
  fixtureDir: `${__dirname}/__testfixtures__/`,
});
