/**
 * @fileoverview Rule to enforce templates are context providers only
 * P2 Priority: Templates should only provide context, no data fetching or business logic
 */

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce templates are context providers only with no data fetching',
      category: 'Atomic Design',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowedHooks: {
            type: 'array',
            items: { type: 'string' },
            default: ['useContext', 'useMemo', 'useCallback', 'useState'],
          },
          forbiddenImports: {
            type: 'array',
            items: { type: 'string' },
            default: ['@/services', '@/services'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noDataFetching: '[ARCHITECTURE] Templates should not fetch data. Data fetching belongs in Organisms. Move {{name}} call to an organism.',
      noServiceImports: '[ARCHITECTURE] Templates should not import services. Services belong in organisms.',
      noBusinessLogic: '[ARCHITECTURE] Templates should only provide context, not contain business logic.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedHooks = options.allowedHooks || ['useContext', 'useMemo', 'useCallback', 'useState'];
    const forbiddenImports = options.forbiddenImports || ['@/services', '@/services'];

    // Track if we're in a template file
    const filename = context.getFilename();
    const isTemplateFile = /templates[\\/][^\\/]+\.(ts|tsx)$/.test(filename);

    if (!isTemplateFile) {
      return {};
    }

    return {
      // Check for data fetching in useEffect
      'CallExpression[callee.name="useEffect"]'(node) {
        // Look for data fetching patterns in the effect
        const effectFn = node.arguments[0];
        if (!effectFn || !effectFn.body) return;

        const body = effectFn.body.type === 'BlockStatement' ? effectFn.body.body : [];

        for (const statement of body) {
          // Check for fetch calls
          if (
            statement.type === 'ExpressionStatement' &&
            statement.expression.type === 'CallExpression'
          ) {
            const call = statement.expression;
            if (call.callee.name === 'fetch') {
              context.report({
                node: call,
                messageId: 'noDataFetching',
                data: { name: 'fetch' },
              });
            }
          }

          // Check for variable declarations with fetch
          if (statement.type === 'VariableDeclaration') {
            for (const decl of statement.declarations) {
              if (
                decl.init &&
                decl.init.type === 'CallExpression' &&
                decl.init.callee.name === 'fetch'
              ) {
                context.report({
                  node: decl.init,
                  messageId: 'noDataFetching',
                  data: { name: 'fetch' },
                });
              }
            }
          }
        }
      },

      // Check for forbidden imports
      ImportDeclaration(node) {
        const source = node.source.value;

        for (const forbidden of forbiddenImports) {
          if (source.startsWith(forbidden)) {
            context.report({
              node,
              messageId: 'noServiceImports',
            });
            return;
          }
        }

        // Check for service-like imports
        if (
          /service/i.test(source) ||
          /api/i.test(source) ||
          /client/i.test(source)
        ) {
          context.report({
            node,
            messageId: 'noServiceImports',
          });
        }
      },

      // Check for hook usage
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name.startsWith('use')
        ) {
          const hookName = node.callee.name;

          // Allow certain hooks
          if (allowedHooks.includes(hookName)) {
            return;
          }

          // Block data-related hooks
          if (
            hookName.includes('Data') ||
            hookName.includes('Fetch') ||
            hookName.includes('Load') ||
            hookName.includes('Query') ||
            hookName.includes('Mutation')
          ) {
            context.report({
              node,
              messageId: 'noDataFetching',
              data: { name: hookName },
            });
          }
        }
      },
    };
  },
};

export default rule;
