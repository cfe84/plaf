const consts = require("../src/consts");
const yaml = require("yaml-js")

const processMd = ({ folderContent, deps }) => {
  const tagRegex = /(^| )#([a-zA-Z0-9-_]+)/gm

  const replaceTags = (content) => {
    return content.replace(tagRegex, `$1<a href="/tags/$2.html">#$2</a>`);
  }

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
  const getTags = (onlyContent) => {
    const tagMatches = onlyContent.match(tagRegex);
    const tags = tagMatches ? tagMatches.map(tag => tag.trim().substring(1)) : [];
    return tags;
  }

  const renderMd = (file) => {
    const path = file.path;
    const content = `${deps.fs.readFileSync(path)}`;
    const parsedContent = parseContent(content);
    const rendered = replaceTags(parsedContent.content);
    const properties = parsedContent.headers || {};
    properties.tags = getTags(parsedContent.content);
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