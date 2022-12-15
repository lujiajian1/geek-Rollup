const acorn = require("acorn");
const MagicString = require("magic-string");
const analyse = require("./analyse");

class Module {
  constructor({ code }) {
    this.code = new MagicString(code);
    this.ast = acorn.parse(this.code, {
      locations: true,
      ranges: true,
      sourceType: "module",
      ecmaVersion: 7,
    });
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
}

module.exports = Module;
