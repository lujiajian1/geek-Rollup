const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const MagicString = require('magic-string');

const code = fs.readFileSync('./source.js').toString()
// console.log(code);
const ast = acorn.parse(code, {
    locations: true,
    ranges: true,
    sourceType: 'module',
    ecmaVersion: 7,
});
// console.log(ast);
const mCode = new MagicString(code);
// console.log(mCode.snip(0, 19).toString());
const declaration = {};
ast.body.forEach(item => {
    if (item.type === 'VariableDeclaration') {
        declaration[item.declarations[0].id.name] = item;
    }
});
// console.log(declaration);
const hasVar = [];
const statements = [];
ast.body
.filter(node => node.type !== 'VariableDeclaration')
.forEach(node => {
    const varName = node.expression.callee.name;
    if (hasVar.indexOf(varName) === -1) {
        statements.push(declaration[varName]);
        hasVar.push(varName);
    }
    statements.push(node);
});
// console.log(statements);
let output = '';
statements.forEach(node => {
    output = output + mCode.snip(node.start, node.end).toString() + '\n';
});
// console.log(output);


