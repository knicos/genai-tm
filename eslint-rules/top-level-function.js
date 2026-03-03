const isFunctionInitializer = (declaration) => {
    if (!declaration || !declaration.init) {
        return false;
    }

    return declaration.init.type === 'ArrowFunctionExpression' || declaration.init.type === 'FunctionExpression';
};

const hasFunctionInitializer = (variableDeclaration) => variableDeclaration.declarations.some(isFunctionInitializer);

const reportIfFunctionVariable = (context, node) => {
    if (node.type !== 'VariableDeclaration') {
        return;
    }

    if (hasFunctionInitializer(node)) {
        context.report({ node, messageId: 'topLevelFunc' });
    }
};

const reportIfExportedFunctionVariable = (context, node) => {
    if (node.type !== 'ExportNamedDeclaration' || !node.declaration) {
        return;
    }

    reportIfFunctionVariable(context, node.declaration);
};

const reportIfDefaultFunctionExpression = (context, node) => {
    if (node.type !== 'ExportDefaultDeclaration') {
        return;
    }

    const decl = node.declaration;
    if (!decl) {
        return;
    }

    if (decl.type === 'ArrowFunctionExpression' || decl.type === 'FunctionExpression') {
        context.report({ node, messageId: 'topLevelFunc' });
    }
};

export default {
    rules: {
        'top-level-function-declaration': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: 'Require function declarations for top-level functions.',
                },
                schema: [],
                messages: {
                    topLevelFunc: 'Use function declarations for top-level functions.',
                },
            },
            create(context) {
                return {
                    Program(node) {
                        for (const statement of node.body) {
                            reportIfFunctionVariable(context, statement);
                            reportIfExportedFunctionVariable(context, statement);
                            reportIfDefaultFunctionExpression(context, statement);
                        }
                    },
                };
            },
        },
    },
};
