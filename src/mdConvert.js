const consts = require("../src/consts");
const yaml = require("yaml-js")

const processMd = ({ folderContent, deps }) => {

  const fixMdLinks = (content) => {
    const regex = /.md(#\w+)?\)/g
    return content.replace(regex, ".html$1)");
  }

  const renderMd = (file) => {
    file.content = deps.marked(fixMdLinks(file.content));
  }

  folderContent
    .filter(file => file.type === consts.fileType.md)
    .forEach(file => renderMd(file))
}

module.exports = processMd;