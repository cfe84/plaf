const consts = require("./consts")

const preprocess = (content, name) => {
  content.forEach(item => {
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

  const root = content.find(element => element.relativePath === "")
  if (root && name) {
    root.title = name;
  }
}

module.exports = preprocess