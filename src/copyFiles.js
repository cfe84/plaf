const consts = require("./consts");

const copyFiles = ({ folderContent, outputFolder, deps }) => {
  folderContent
    .filter(file => file.type === consts.fileType.file)
    .forEach(file =>
      deps.fs.copyFileSync(file.path, deps.path.join(outputFolder, file.relativePath)));
}

module.exports = copyFiles;