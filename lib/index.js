const fs = require('fs');
const path = require('path');
// acorn：JavaScript解析器
const acorn = require('acorn');
// magic-string：一个用于操作字符串和生成源映射的小而快的库; 其实它最主要的功能就是对一些源代码和庞大的 AST 字符串做轻量级字符串的替换;
const MagicString = require('magic-string');

// 读取文件的 code
const code = fs.readFileSync('./source.js').toString()
// 将 code 转为 AST
const ast = acorn.parse(code, {
    locations: true,
    ranges: true,
    sourceType: 'module',
    ecmaVersion: 7,
});
const mCode = new MagicString(code);
// 遍历 AST 中的变量 key: variableName value: ASTItem
const declaration = {};
ast.body.forEach(item => {
    if (item.type === 'VariableDeclaration') {
        declaration[item.declarations[0].id.name] = item;
    }
});
// 遍历找到被调用的变量声明和变量调用 statements
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
// 删除没用调用变量（tree shaking）输出最后的代码
let output = '';
statements.forEach(node => {
    output = output + mCode.snip(node.start, node.end).toString() + '\n';
});
console.log(output);
