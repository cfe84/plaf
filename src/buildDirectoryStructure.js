const consts = require("./consts")

const buildDirectoryStructure = (outputFolder, content, deps) => {
  // deps.fs.mkdirSync(outputFolder)
  content
    .filter(item => item.type === consts.fileType.folder)
    .map(folder => folder.relativePath)
    .sort((a, b) => a.length < b.length)
    .map(folder => deps.path.join(outputFolder, folder))
    .forEach(folder => deps.fs.mkdirSync(folder))
}

module.exports = buildDirectoryStructure