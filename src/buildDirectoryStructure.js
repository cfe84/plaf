const consts = require("./consts")

const buildDirectoryStructure = ({ outputFolder, folderContent, deps }) => {
  folderContent
    .filter(item => item.type === consts.fileType.folder)
    .map(folder => folder.relativePath)
    .sort((a, b) => a.length < b.length)
    .map(folder => deps.path.join(outputFolder, folder))
    .forEach(folder => deps.fs.mkdirSync(folder))
}

module.exports = buildDirectoryStructure