const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;

let ID = 0;

function createAsset(filename) {
  const content = fs.readFileSync(filename, 'utf-8');

  const ast = babylon.parse(content, {
    sourceType: 'module'
  });

  const dependencies = [];

  traverse(ast, {
    ImportDeclaration: ({
      node
    }) => {
      dependencies.push(node.source.value);
    }
  });

  const id = ID++;

  return {
    id,
    filename,
    dependencies

  };
}

function createGraph(entry) {
  const mainAsset = createAsset(entry);

  const queue = [mainAsset];

  for (const asset of queue) {

    const dirname = path.dirname(asset.filename);
    asset.mapping = {};
    asset.dependencies.forEach(
      relativePath => {
        const absolutePath = path.join(dirname, relativePath);

        const child = createAsset(absolutePath);

        asset.mapping[relativePath] = child.id;

        queue.push(child);
      }
    );
  }

  return queue;
}

function bundle(graph) {
  const modules = '';

  const result = `
   (function(){

   })({

   })
  `;
  return result;
}

const graph = createGraph('./example/entry.js');
const result = bundle(graph);
console.log(result);