/**
 * @fileoverview Rule to restrict useEffect usage in molecules
 * P3 Priority: Detect useEffect that reaches outside (API calls, external services)
 */

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Restrict useEffect in molecules from calling external services or domain logic',
      category: 'Atomic Design',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
            default: ['^set', '^clear', '^addEventListener', '^removeEventListener'],
          },
          forbiddenPatterns: {
            type: 'array',
            items: { type: 'string' },
            default: ['^fetch', '^load', '^get', '^save', '^update', '^delete', '^create', '^api', '^request'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noExternalCalls: '[ARCHITECTURE] useEffect in molecules should not call external services ({{callee}}). Move to organism or use props callback.',
      noAsyncEffect: '[ARCHITECTURE] useEffect in molecules should not be async or contain async operations. Use props to receive data.',
      noServiceCalls: '[ARCHITECTURE] useEffect in molecules should not call service methods ({{callee}}). Services belong in organisms.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedPatterns = (options.allowedPatterns || ['^set', '^clear', '^addEventListener', '^removeEventListener']).map(
      (p) => new RegExp(p)
    );
    const forbiddenPatterns = (options.forbiddenPatterns || ['^fetch', '^load', '^get', '^save', '^update', '^delete', '^create', '^api', '^request']).map(
      (p) => new RegExp(p)
    );

    // Track if we're in a molecule file
    const filename = context.getFilename();
    const isMoleculeFile = /molecules[\\/][^\\/]+\.(ts|tsx)$/.test(filename);

    if (!isMoleculeFile) {
      return {};
    }

    let insideUseEffect = false;
    let useEffectDepth = 0;

    function isAllowed(name) {
      return allowedPatterns.some((pattern) => pattern.test(name));
    }

    function isForbidden(name) {
      return forbiddenPatterns.some((pattern) => pattern.test(name));
    }

    function checkCallExpression(node) {
      if (!insideUseEffect) return;

      let calleeName = '';

      if (node.callee.type === 'Identifier') {
        calleeName = node.callee.name;
      } else if (
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier'
      ) {
        calleeName = node.callee.property.name;
      }

      if (!calleeName) return;

      // Check for forbidden patterns
      if (isForbidden(calleeName) && !isAllowed(calleeName)) {
        context.report({
          node,
          messageId: 'noExternalCalls',
          data: { callee: calleeName },
        });
      }

      // Check for service-like calls (method calls on objects that look like services)
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier'
      ) {
        const objectName = node.callee.object.name;
        // Common service naming patterns
        if (
          /service$/i.test(objectName) ||
          /api$/i.test(objectName) ||
          /client$/i.test(objectName) ||
          /store$/i.test(objectName)
        ) {
          context.report({
            node,
            messageId: 'noServiceCalls',
            data: { callee: `${objectName}.${calleeName}` },
          });
        }
      }
    }

    return {
      // Detect entering useEffect
      'CallExpression[callee.name="useEffect"]'(node) {
        insideUseEffect = true;
        useEffectDepth = 1;

        // Check if the effect function is async
        const effectArg = node.arguments[0];
        if (effectArg) {
          if (effectArg.async) {
            context.report({
              node: effectArg,
              messageId: 'noAsyncEffect',
            });
          }

          // Check for async IIFE
          if (
            effectArg.type === 'ArrowFunctionExpression' ||
            effectArg.type === 'FunctionExpression'
          ) {
            const body = effectArg.body;
            if (body.type === 'BlockStatement') {
              // Check for async operations in the body
              for (const statement of body.body) {
                if (
                  statement.type === 'ExpressionStatement' &&
                  statement.expression.type === 'CallExpression'
                ) {
                  const call = statement.expression;
                  if (
                    call.callee.type === 'ArrowFunctionExpression' &&
                    call.callee.async
                  ) {
                    context.report({
                      node: call,
                      messageId: 'noAsyncEffect',
                    });
                  }
                }
              }
            }
          }
        }
      },

      // Track nested function boundaries
      ':matches(FunctionExpression, ArrowFunctionExpression, FunctionDeclaration)'(
        node
      ) {
        if (insideUseEffect) {
          useEffectDepth++;
        }
      },

      ':matches(FunctionExpression, ArrowFunctionExpression, FunctionDeclaration):exit'() {
        if (insideUseEffect) {
          useEffectDepth--;
          if (useEffectDepth === 0) {
            insideUseEffect = false;
          }
        }
      },

      // Check call expressions inside useEffect
      CallExpression(node) {
        checkCallExpression(node);
      },

      // Reset on useEffect exit
      'CallExpression[callee.name="useEffect"]:exit'() {
        useEffectDepth = 0;
        insideUseEffect = false;
      },
    };
  },
};

export default rule;
