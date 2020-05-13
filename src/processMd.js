const consts = require("../src/consts");
const yaml = require("yaml-js")

const processMd = ({ folderContent, deps }) => {


  const parseContent = (content) => {
    const headerStartLineIndex = content.indexOf("---\n");
    if (headerStartLineIndex !== 0) {
      return { content };
    }
    const headerFinishLineIndex = content.indexOf("---\n", headerStartLineIndex + 3);
    if (headerFinishLineIndex < 0) {
      return { content };
    }
    const headerContent = content.substring(headerStartLineIndex + 4, headerFinishLineIndex).trim();
    const onlyContent = content.substring(headerFinishLineIndex + 4).trim();
    const headers = yaml.load(headerContent)
    const res = {
      content: onlyContent,
      headers: headers
    }
    return res;
  }

  const renderMd = (file) => {
    const path = file.path;
    const content = `${deps.fs.readFileSync(path)}`;
    const parsedContent = parseContent(content);
    const rendered = parsedContent.content;
    const properties = parsedContent.headers || {};
    if (properties.title)
      file.title = properties.title;
    else
      properties.title = file.title;
    file.content = rendered;
    file.mdcontent = parsedContent.content;
    file.properties = properties;
  }

  folderContent
    .filter(file => file.type === consts.fileType.md)
    .forEach(file => renderMd(file))
}

module.exports = processMd;