const consts = require("./consts")

const preprocess = ({ folderContent, name }) => {
  folderContent.forEach(item => {
    switch (item.type) {
      case consts.fileType.md:
        item.title = item.filename.replace(/\.md$/i, "");
        break;

      case consts.fileType.file:
      case consts.fileType.folder:
      default:
        item.title = item.filename;
        break;
    }
  })

  const root = folderContent.find(element => element.relativePath === "")
  if (root && name) {
    root.title = name;
  }
}

module.exports = preprocess