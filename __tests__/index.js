const _eval = require("eval");
const t = require("babel-types");
const generate = require("babel-generator").default;

const {
  generateTypeCheck,
  generateIsOneOfCheck,
  generateInstanceOfCheck
} = require("../");

describe("babel-generate-guard-clauses", () => {
  describe("generateTypeCheck", () => {
    describe("literals", () => {
      it("should not fail for right type", () => {
        const ast = t.program([
          t.variableDeclaration("const", [
            t.variableDeclarator(t.identifier("x"), t.numericLiteral(3))
          ]),
          generateTypeCheck("number")({ name: "x" })
        ]);
        const code = generate(ast).code;
        const res = _eval(code + "module.exports = 42");

        expect(res).toBe(42);
      });

      it("should fail for wrong type", () => {
        const ast = t.program([
          t.variableDeclaration("const", [
            t.variableDeclarator(t.identifier("x"), t.stringLiteral("foo"))
          ]),
          generateTypeCheck("number")({ name: "x" })
        ]);
        const code = generate(ast).code;

        expect(() => {
          _eval(code + "module.exports = 42");
        }).toThrowErrorMatchingSnapshot();
      });
    });

    describe("object", () => {
      it("should not fail for right type", () => {
        const ast = t.program([
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier("x"),
              t.objectExpression([
                t.objectProperty(t.identifier("foo"), t.numericLiteral(42))
              ])
            )
          ]),
          generateTypeCheck("number", { selector: "foo" })({ name: "x" })
        ]);
        const code = generate(ast).code;
        const res = _eval(code + "module.exports = 42");

        expect(res).toBe(42);
      });

      it("should fail for wrong type", () => {
        const ast = t.program([
          t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier("x"),
              t.objectExpression([
                t.objectProperty(t.identifier("foo"), t.stringLiteral("432"))
              ])
            )
          ]),
          generateTypeCheck("number", { selector: "foo" })({
            name: "x"
          })
        ]);
        const code = generate(ast).code;

        expect(() => {
          _eval(code + "module.exports = 42");
        }).toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe("generateIsOneOfCheck", () => {
    it("should not fail for right type", () => {
      const ast = t.program([
        t.variableDeclaration("const", [
          t.variableDeclarator(t.identifier("x"), t.stringLiteral("foo"))
        ]),
        generateIsOneOfCheck(["foo", "bar"])({ name: "x" })
      ]);
      const code = generate(ast).code;
      const res = _eval(code + "module.exports = 42");

      expect(res).toBe(42);
    });

    it("should fail for wrong type", () => {
      const ast = t.program([
        t.variableDeclaration("const", [
          t.variableDeclarator(t.identifier("x"), t.stringLiteral("baz"))
        ]),
        generateIsOneOfCheck(["foo", "bar"])({ name: "x" })
      ]);
      const code = generate(ast).code;

      expect(() => {
        _eval(code + "module.exports = 42");
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe("generateInstanceOfCheck", () => {
    it("should not fail for right type", () => {
      const ast = t.program([
        t.variableDeclaration("const", [
          t.variableDeclarator(t.identifier("x"), t.stringLiteral("foo"))
        ]),
        generateInstanceOfCheck("String")({ name: "x" })
      ]);
      const code = generate(ast).code;
      const res = _eval(code + "module.exports = 42");

      expect(res).toBe(42);
    });

    it("should fail for wrong type", () => {
      const ast = t.program([
        t.variableDeclaration("const", [
          t.variableDeclarator(t.identifier("x"), t.booleanLiteral(true))
        ]),
        generateInstanceOfCheck("String")({ name: "x" })
      ]);
      const code = generate(ast).code;

      expect(() => {
        _eval(code + "module.exports = 42");
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
