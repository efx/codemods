const { getParser } = require('codemod-cli').jscodeshift;
module.exports = function transformer(file, api) {
  const j = getParser(api);
  const root = j(file.source);

  const replaceExpression = (p) => {
    const methodExp = j.memberExpression(
      j.identifier('assert'),
      j.identifier(p.value.expression.callee.property.name),
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
        p.parent.parent.value.property?.name === 'not' &&
        p.parent.parent.parent.value.property.name === 'equal'
      );
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
    .find(j.Identifier, {
      name: 'should',
    })
    .filter((p) => {
      return (
        p.parent.value.property?.name === 'not' && p.parent.parent.value.property.name === 'exist'
      );
    })
    .forEach((p) => {
      const methodExp = j.memberExpression(j.identifier('assert'), j.identifier('notOk'), false);

      p.parent.parent.parent.replace(
        j.callExpression(methodExp, [...p.parent.parent.parent.value.arguments])
      );
    });

  root
    .find(j.Identifier, {
      name: 'should',
    })
    .filter((p) => {
      return (
        p.parent.parent.value.property?.name === 'equal' ||
        p.parent.parent.value.property?.name === 'eql'
      );
    })
    .forEach((p) => {
      const methodExp = j.memberExpression(j.identifier('assert'), j.identifier('equal'), false);

      p.parent.parent.parent.replace(
        j.callExpression(methodExp, [
          p.parent.value.object,
          ...p.parent.parent.parent.value.arguments,
        ])
      );
    });

  root
    .find(j.Identifier, {
      name: 'should',
    })
    .filter((p) => {
      return p.parent.value.property?.name === 'exist';
    })
    .forEach((p) => {
      const methodExp = j.memberExpression(j.identifier('assert'), j.identifier('ok'), false);

      p.parent.parent.replace(j.callExpression(methodExp, [...p.parent.parent.value.arguments]));
    });

  root
    .find(j.Identifier, {
      name: 'should',
    })
    .filter((p) => {
      return p.parent.parent.value.property?.name === 'match';
    })
    .forEach((p) => {
      const methodExp = j.memberExpression(j.identifier('assert'), j.identifier('ok'), false);

      p.parent.parent.parent.replace(
        j.callExpression(methodExp, [
          j.callExpression(
            j.memberExpression(
              // 'some stirng'
              p.parent.value.object,
              // match
              p.parent.parent.parent.value.callee.property,
              false
            ),
            [...p.parent.parent.parent.value.arguments]
          ),
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
