import Graph from "./index.js";

const graph = new Graph();
graph.addExpression("y=2^x");

graph.save().then(console.log);
