const { parse } = require("acorn");
const MagicString = require("magic-string");
const analyse = require("./analyse");

const SYSTEM_VARS = ["console", "log"];

function has(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

class Module {
  constructor({ code, path, bundle }) {
    this.code = new MagicString(code, { filename: path });
    this.path = path;
    this.bundle = bundle;
    // Parse阶段
    this.ast = parse(code, {
      ecmaVersion: 7,
      sourceType: "module",
    });
    // Transfer
    this.analyse();
  }
  analyse() {
    this.imports = {};
    this.exports = {};
    this.ast.body.forEach((i) => {
      if (i.type === "ImportDeclaration") {
        i.specifiers.forEach((s) => {
          const key = s.local?.name;
          if (key) {
            this.imports[key] = {
              localName: key,
              name: s.imported?.name || "",
              source: i.source.value,
            };
          }
        });
      } else if (/^Export/.test(i.type)) {
        const declaration = i.declaration;
        if (declaration.type === "VariableDeclaration") {
          if (!declaration.declarations) return;
          const localName = declaration.declarations[0].id.name;
          this.exports[localName] = {
            node: i,
            localName,
            expression: declaration,
          };
        }
      }
    });

    analyse(this.ast, this.code, this);
    this.definitions = {};
    this.ast.body.forEach((statement) => {
      Object.keys(statement._defines).forEach((name) => {
        this.definitions[name] = statement;
      });
    });
  }

  expandAllStatement() {
    const allStatements = [];
    this.ast.body.forEach((statement) => {
      // 忽略 import && declaration
      if (statement.type === "ImportDeclaration") return;
      if (statement.type === "VariableDeclaration") return;
      const statements = this.expandStatement(statement);
      allStatements.push(...statements);
    });

    return allStatements;
  }

  // 扩展单个语句：声明 + 调用
  expandStatement(statement) {
    statement._included = true; // 此语句已经被引用
    const result = [];
    const dependencies = Object.keys(statement._dependsOn);
    dependencies.forEach((name) => {
      const definitions = this.define(name);
      result.push(...definitions);
    });

    // 添加自己
    result.push(statement);
    return result;
  }

  // 查找变量声明
  define(name) {
    if (has(this.imports, name)) {
      // import 模块外
      // 加载模块
      // import 项的声明部分
      const importDeclaration = this.imports[name];
      // 获取msg模块 export import
      // 读取声明模块
      const module = this.bundle.fetchModule(
        importDeclaration.source,
        this.path
      );

      // this.exports['age'] =
      const exportData = module.exports[importDeclaration.name];
      // 用msg模块的define 目的返回
      return module.define(exportData.localName);
    } else {
      // 本模块
      const statement = this.definitions[name];
      if (statement) {
        if (statement._included) {
          return [];
        } else {
          // 递归
          // const b = a + 1;
          return this.expandStatement(statement);
        }
      } else if (SYSTEM_VARS.includes(name)) {
        return [];
      } else {
        throw new Error("没有此变量" + name);
      }
    }
  }
}

module.exports = Module;
