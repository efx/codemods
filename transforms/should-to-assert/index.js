const { getParser } = require('codemod-cli').jscodeshift;
const shouldToAssert = new Map([['eql', 'equal']]);
module.exports = function transformer(file, api) {
  const j = getParser(api);
  const root = j(file.source);

  const replaceExpression = (p) => {
    // should.equal()
    const method = p.value.expression.callee.property.name;
    const methodExp = j.memberExpression(
      j.identifier('assert'),
      j.identifier(shouldToAssert.get(method) || method),
      false
    );
    let expr = p.value.expression.callee.object.object;
    // remove should for should.be.ok() or other expressions
    if (expr.property?.name === 'should') {
      expr = expr.object;
    }
    const newNode = j.expressionStatement(
      j.callExpression(methodExp, [expr, ...p.value.expression.arguments])
    );
    j(p).replaceWith(newNode);
  };

  root
    .find(j.ExpressionStatement, {
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            property: {
              type: 'Identifier',
              name: 'should',
            },
          },
        },
      },
    })
    .forEach(replaceExpression);

  root
    .find(j.ExpressionStatement, {
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            property: {
              type: 'Identifier',
              name: 'be',
            },
          },
        },
      },
    })
    .forEach(replaceExpression);

  return root.toSource();
};

module.exports.type = 'js';
