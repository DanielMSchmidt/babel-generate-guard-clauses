const t = require("babel-types");
const template = require("babel-template");

// Helper methods to easily stick together type checks
// generates the following JS:
// if (CHECK_GENERATOR) {
//   throw new Error(ERROR_STRING_GENERATOR);
// }
const generateCheck = (checkGenerator, errorStringGenerator) => ({
  type,
  name
}) =>
  t.ifStatement(
    checkGenerator({ type, name }),
    t.throwStatement(
      t.newExpression(t.identifier("Error"), [errorStringGenerator({ name })])
    )
  );

// generates "typeof argName !== 'number'"
const typeCheckTestGenerator = (typeAssertion, options) => ({ name }) =>
  t.binaryExpression(
    "!==",
    t.unaryExpression(
      "typeof",
      options.selector
        ? t.memberExpression(t.identifier(name), t.identifier(options.selector))
        : t.identifier(name)
    ),
    t.stringLiteral(typeAssertion)
  );

// helper for generating verbose errors, generates
// throw new Error('argName should be a number, but got ' + argName + '(' + typeof argName +  ')');
const typeCheckErrorGenerator = (typeAssertion, options) => ({ name }) => {
  const nameString = options.selector ? `${name}.${options.selector}` : name;
  const nameAst = options.selector
    ? t.memberExpression(t.identifier(name), t.identifier(options.selector))
    : t.identifier(name);

  return t.binaryExpression(
    "+",
    t.stringLiteral(
      nameString + " should be a " + typeAssertion + ", but got "
    ),
    t.binaryExpression(
      "+",
      nameAst,
      t.binaryExpression(
        "+",
        t.stringLiteral(" ("),
        t.binaryExpression(
          "+",
          t.unaryExpression("typeof", nameAst),
          t.stringLiteral(")")
        )
      )
    )
  );
};

const oneOfCheckTestGenerator = options => ({ name }) =>
  t.unaryExpression(
    "!",
    t.callExpression(
      t.memberExpression(
        t.arrayExpression(options.map(option => t.stringLiteral(option))),
        t.identifier("some")
      ),
      [
        t.arrowFunctionExpression(
          [t.identifier("option")],
          t.binaryExpression("===", t.identifier("option"), t.identifier(name))
        )
      ]
    )
  );

const oneOfCheckErrorGenerator = options => ({ name }) =>
  t.binaryExpression(
    "+",
    t.stringLiteral(
      name + " should be one of [" + options.join(", ") + "], but got "
    ),
    t.identifier(name)
  );

const generateTypeCheck = (typeAssertion, options = {}) =>
  generateCheck(
    typeCheckTestGenerator(typeAssertion, options),
    typeCheckErrorGenerator(typeAssertion, options)
  );

// if (!['option1', 'option2'].some(x => x === argName)) {
//   return new Error("argName should be one of ['option1', 'option2'], but got " + argName);
// }
const generateIsOneOfCheck = options =>
  generateCheck(
    oneOfCheckTestGenerator(options),
    oneOfCheckErrorGenerator(options)
  );


// if (!(matcher instanceof Matcher)) {
//   throw new Error(`Matcher withAncestor argument must be a valid Matcher, got ${typeof matcher}`);
// } 
const instanceOfCheck = template(`
  if (!(ARG_NAME instanceof INSTANCE_NAME)) {
    return new Error(ARG_NAME + ' should be an instance of ' + INSTANCE_NAME + ', but got ' + ARG_NAME);
  }
`)

const generateInstanceOfCheck = instanceType => ({ name }) => instanceOfCheck({
  ARG_NAME: t.identifier(name),
  INSTANCE_NAME: t.identifier(instanceType)
});

module.exports = {
  generateTypeCheck,
  generateIsOneOfCheck,
  generateInstanceOfCheck
};
