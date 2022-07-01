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
    .find(j.Identifier, {
      name: 'should',
    })
    .filter((p) => {
      return (
        p.parent.parent.value.property.name === 'not' &&
        p.parent.parent.parent.value.property.name === 'equal'
      );
      // return p.parentPath.parentPath.value.property.name === 'be';
    })
    .forEach((p) => {
      const methodExp = j.memberExpression(j.identifier('assert'), j.identifier('notEqual'), false);

      p.parent.parent.parent.parent.replace(
        j.callExpression(methodExp, [
          p.parent.value.object,
          ...p.parent.parent.parent.parent.value.arguments,
        ])
      );
    });

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
