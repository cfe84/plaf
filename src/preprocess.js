const consts = require("./consts")

const preprocess = (content) => {
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
}

module.exports = preprocess