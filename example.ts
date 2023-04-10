import Graph from "./index.js";

new Graph()
    .addExpression("y=2^x")
    .save()
    .then(console.log);
