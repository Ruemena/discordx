---
id: esm-vs-cjs
sidebar_label: ESM vs CJS
---

# ECMAScript (ESM) vs CommonJS (CJS)

## Basics

This document provides a very basic overview: please refer to the linked references for more information.

### What is a module?

A module is simply a JavaScript or TypeScript file, usually one that contains functions and variables to be exported.

### What are the two kinds of modules?

There are two main built-in systems to handle modules: [CommonJS (CJS)](https://nodejs.org/docs/latest/api/modules.html) and [ECMAScript (ESM)](https://nodejs.org/docs/latest/api/esm.html). CommonJS is the default for Node.js, but is an older and less secure module system. ECMAScript is the standard for JavaScript, and is not enabled by default but is required for certain packages. 

### How do I determine my module system?

Look at the `type` field in `package.json`. Because CommonJS is the default, no `type` field will result in the runtime automatically using CJS. 

_The "type" field defines the module format that Node.js uses for all .js files that have that package.json file as their nearest parent_ - [Node.js](https://nodejs.org/docs/latest/api/packages.html#type)

A type of `module` will result in ESM modules, while a type of `commonjs` will result in CJS modules. 

```ts title="package.json"
{
    "type":"module" // ECMAScript
}
```
```ts title="package.json"
{
    "type":"commonjs" // CommonJS
}
```

### Import in CJS vs ESM

ESM requires that the name of imported modules end with a file extension. However, CJS ignores this and will work with or without a file extension in the name.

```ts
import { helper } from "./foo"; // ❌ only works in CJS

import { helper } from "./foo.js"; // ✅ works in ESM & CJS
```
