const { getParser } = require('codemod-cli').jscodeshift;

module.exports = function transformer(file, api) {
  const j = getParser(api);
  const root = j(file.source);
  root
    .find(j.FunctionExpression)
    .filter((path) => path.parent.node.callee && ['test'].includes(path.parent.node.callee.name))
    .forEach((n) => {
      n.value.params.push(j.identifier('assert'));
    });

  return root.toSource();
};

module.exports.type = 'js';
