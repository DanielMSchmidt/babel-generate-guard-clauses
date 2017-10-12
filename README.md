# Babel-Generate-Guard-Clause ![travis status](https://travis-ci.org/DanielMSchmidt/babel-generate-guard-clauses.svg?branch=master)

A helper to generate different guard clauses.

## Exports

### `generateTypeCheck(typeAssertion, options)({ name: argumentName })`

#### `generateTypeCheck("number")({ name: argumentName })`

```js
const typeCheckAst = genertateTypeCheck("string")({ name: "ponies" });
```

Generated Code:
```js
if (typeof ponies !== "string") {
    throw new Error('ponies should be a string, but got ' + ponies + '(' + typeof ponies +  ')');
}
```

#### `generateTypeCheck("number", { selector: "selector" })({ name: argumentName })`

```js
const typeCheckAst = generateTypeCheck("number", { selector: "x" })({ name: "point" });
```

Generated Code:
```js
if (typeof point.x !== "number") {
    throw new Error('point.x should be a number, but got ' + point.x + '(' + typeof point.x +  ')');
}
```

### `generateIsOneOfCheck`

#### `generateIsOneOfCheck(optionArray)({ name: "argName" })`

```js
const typeCheckAst = generateIsOneOfCheck(["option1", "option2"])({ name: "argName" });
```

Generated Code:
```js
if (!['option1', 'option2'].some(x => x === argName)) {
   return new Error("argName should be one of ['option1', 'option2'], but got " + argName);
}
```
