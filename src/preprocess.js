const consts = require("./consts")

const preprocess = ({ folderContent, name }) => {
  folderContent.forEach(item => {
    switch (item.type) {
      case consts.fileType.md:
        item.title = item.filename.replace(/\.md$/i, "");
        item.outputFilename = item.filename.replace(/\.md$/i, ".html");
        item.outputRelativePath = item.relativePath.replace(/\.md$/i, ".html");
        break;

      case consts.fileType.file:
      case consts.fileType.folder:
      default:
        item.title = item.filename;
        item.outputFilename = item.filename;
        item.outputRelativePath = item.relativePath;
        break;
    }
    item.folderContent = folderContent
    item.mdFiles = folderContent.filter(file => file.type === consts.fileType.md)
  })

  const root = folderContent.find(element => element.relativePath === "")
  if (root && name) {
    root.title = name;
  }
}

module.exports = preprocess