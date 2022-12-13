describe("AST Walk函数", () => {
  test("单个节点", () => {
    const ast = {
      a: "1",
    };
    const mockEnter = jest.fn();
    const mockLeave = jest.fn();

    const walk = require("../walk");
    walk(ast, {
      enter: mockEnter,
      leave: mockLeave,
    });
    let calls = mockEnter.mock.calls;

    expect(calls.length).toBe(1);
    expect(calls[0][0]).toEqual({ a: "1" });
    calls = mockLeave.mock.calls;

    expect(calls.length).toBe(1);
    expect(calls[0][0]).toEqual({ a: "1" });
  });

  test("数组节点", () => {
    const ast = {
      a: [{ b: "2" }, {c: "3" }],
    };
    const mockEnter = jest.fn();
    const mockLeave = jest.fn();

    const walk = require("../walk");
    walk(ast, {
      enter: mockEnter,
      leave: mockLeave,
    });
    let calls = mockEnter.mock.calls;

    expect(calls.length).toBe(4);
    expect(calls[0][0]).toEqual({ a: [{ b: "2" }, {c: "3" }] });
    expect(calls[1][0]).toEqual([{ b: "2" }, {c: "3" }]);
    expect(calls[2][0]).toEqual({ b: "2" });
    expect(calls[3][0]).toEqual({ c: "3" });

    calls = mockLeave.mock.calls;

    expect(calls.length).toBe(4);
    expect(calls[0][0]).toEqual({ b: "2" });
    expect(calls[1][0]).toEqual({ c: "3" });
    expect(calls[2][0]).toEqual([{ b: "2" }, {c: "3" }]);
    expect(calls[3][0]).toEqual({ a: [{ b: "2" }, {c: "3" }] });
  });
});
