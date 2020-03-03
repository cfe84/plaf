const consts = require("./consts");

const tagRegex = /(^| )#([a-zA-Z0-9-_]+)/gm

function createFolder(file, filePath, relativePath, content) {
  return {
    type: consts.fileType.folder,
    filename: file,
    path: filePath,
    relativePath,
    content
  };
}

const crawl = (inputFolder, outputFolder, deps) => {

  function isIgnored(file) {
    return file[0] === "."
      || file === outputFolder
  }

  const crawlFolder = (inputFolder, inputRelativePath = "") => {
    const files = deps.fs.readdirSync(inputFolder);
    const res = files.map(file => {
      if (isIgnored(file)) {
        return {
          type: "ignore"
        }
      }
      const filePath = deps.path.join(inputFolder, file)
      const relativePath = deps.path.join(inputRelativePath, file).replace(/^\//, "");
      const stats = deps.fs.lstatSync(filePath);
      if (stats.isDirectory()) {
        const content = crawlFolder(filePath, relativePath);
        return createFolder(file, filePath, relativePath, content)
      } else {
        const type = /\.md$/i.exec(file);
        return {
          type: !!type ? consts.fileType.md : consts.fileType.file,
          path: filePath,
          relativePath,
          filename: file
        }
      }
    })
      .filter(file => file.type !== "ignore");
    return res;
  }

  const flatten = (folder) =>
    folder.content.reduce((res, file) =>
      res.concat(file.type === consts.fileType.folder ? flatten(file) : [file]), [folder])

  const content = crawlFolder(inputFolder, "");
  const rootFolderContent = createFolder(inputFolder, inputFolder, "", content)
  const allFilesAndFolders = flatten(rootFolderContent)
  return allFilesAndFolders;
}

module.exports = crawl;