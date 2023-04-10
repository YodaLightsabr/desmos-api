# Desmos builder

Generate Desmos links in 5 lines of code


## Installation

```bash
npm install desmos-builder
```

```bash
yarn add desmos-builder
```

## Usage

```js
import { Graph } from 'desmos-builder';

new Graph()
    .addExpression("y=2^x")
    .save()
    .then(console.log);
```