const consts = require("./consts");

const copyFiles = (content, outputDirectory, deps) => {
  content
    .filter(file => file.type === consts.fileType.file)
    .forEach(file =>
      deps.fs.copyFileSync(file.path, deps.path.join(outputDirectory, file.relativePath)));
}

module.exports = copyFiles;