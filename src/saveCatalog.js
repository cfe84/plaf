const consts = require("./consts")

const saveCatalog = ({ folderContent, outputFolder, deps }) => {
  const skippedFolders = folderContent
    .filter(folder => folder.type === consts.fileType.folder && (folder.noSearch || (folder.properties && folder.properties.noSearch)))
    .map(folder => folder.relativePath)
  const isNotSkipped = entry => !(entry.noSearch || (entry.properties && entry.properties.noSearch))
  const isNotInSkippedFolder = entry => !(skippedFolders.find(skippedFolder => entry.relativePath.startsWith(skippedFolder)));
  const serializedContent = JSON.stringify(folderContent
    .filter(entry => entry.type === consts.fileType.md)
    .filter(isNotSkipped)
    .filter(isNotInSkippedFolder)
    .map(entry => { entry.relativePath = entry.relativePath.replace(/md$/, "html"); return entry }));
  const catalog = `const catalog = ${serializedContent}`
  deps.fs.writeFileSync(deps.path.join(outputFolder, "search", "catalog.js"), catalog);
}
module.exports = saveCatalog;