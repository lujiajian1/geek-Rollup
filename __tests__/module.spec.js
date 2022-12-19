const Module = require("../module.js");
describe("Test Module", () => {
  describe("Imports", () => {
    test("Imports", () => {
      const code = "import a from '../module'";
      const module = new Module({ code });
      expect(module.imports).toEqual({
        a: { localName: "a", name: "", source: "../module" },
      });
    });
    test("Imports 解构赋值 as关键字", () => {
      const code = "import {a as b} from '../module'";
      const module = new Module({ code });
      expect(module.imports).toEqual({
        b: { localName: "b", name: "a", source: "../module" },
      });
    });
    test("Imports 解构赋值 as关键字", () => {
      const code = "import {a as b, c} from '../module'";
      const module = new Module({ code });
      expect(module.imports).toEqual({
        b: { localName: "b", name: "a", source: "../module" },
        c: { localName: "c", name: "c", source: "../module" },
      });
    });
    test("Imports 解构赋值 as关键字", () => {
      const code =
        "import {a as b, c} from '../module';import d from '../module';";
      const module = new Module({ code });
      expect(module.imports).toEqual({
        b: { localName: "b", name: "a", source: "../module" },
        c: { localName: "c", name: "c", source: "../module" },
        d: { localName: "d", name: "", source: "../module" },
      });
    });
  });

  describe("Export", () => {
    test("Export", () => {
      const code = "export var a = 1";
      const module = new Module({ code });
      expect(module.exports["a"].localName).toBe("a");
      expect(module.exports["a"].node).toBe(module.ast.body[0]);
      expect(module.exports["a"].expression).toBe(
        module.ast.body[0].declaration
      );
    });
  });

  describe("definitions", () => {
    test("单个变量", () => {
      const code = "const a = 1";
      const module = new Module({ code });
      expect(module.definitions).toEqual({ a: module.ast.body[0] });
    });
  });

  describe("ExpandAllStatement", () => {
    test("基础", () => {
      const code = `const a = () => 1;
                    const b = () => 2;
                    a();`;
      const module = new Module({ code });
      const statements = module.expandAllStatement();
      expect(statements.length).toBe(2);
      expect(module.code.snip(statements[0].start, statements[0].end).toString()).toEqual('const a = () => 1;');
      expect(module.code.snip(statements[1].start, statements[1].end).toString()).toEqual('a();');
    });
  });
});
