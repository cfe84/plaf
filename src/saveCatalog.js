const consts = require("./consts")

const saveCatalog = (content, outputFolder, deps) => {
  const serializedContent = JSON.stringify(content
    .filter(entry => entry.type === consts.fileType.md)
    .map(entry => { entry.relativePath = entry.relativePath.replace(/md$/, "html"); return entry }));
  const catalog = `const catalog = ${serializedContent}`
  deps.fs.writeFileSync(deps.path.join(outputFolder, "search", "catalog.js"), catalog);
}
module.exports = saveCatalog;