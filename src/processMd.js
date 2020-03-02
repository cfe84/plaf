const consts = require("../src/consts");

const processMd = (content, deps) => {
  const tagRegex = /(^| )#([a-zA-Z0-9-_]+)/gm

  const fixMdLinks = (content) => {
    const regex = /.md(#\w+)?\)/g
    return content.replace(regex, ".html$1)");
  }

  const replaceRefs = (content) => {
    const referenceRegex = /\s*\((\[ref\]\([^)]+\))\)/g
    return content
      .replace(referenceRegex, `<sup>$1</sup>`)
  }

  const replaceFootNotes = (content) => {
    const notesRegex = /(?:\s|^)\[\^(\d+)\]\s*:/g
    const referenceRegex = /(\S)\[\^(\d+)\]/g
    return content
      .replace(notesRegex, ` <a name="note-$1" href="#ref-$1">[$1]</a>: `)
      .replace(referenceRegex, `$1<sup><a name="ref-$2" href="#note-$2">[$2]</a></sup>`)
  }

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
    const headerRegex = /^([^:]+)\s*:\s*(.*)/;
    const headers = headerContent
      .split("\n")
      .map(line => {
        const matches = headerRegex.exec(line);
        return {
          key: matches[1],
          value: matches[2]
        }
      })
      .reduce((aggregatedObject, line) => { aggregatedObject[line.key] = line.value; return aggregatedObject }, {});
    const tagMatches = onlyContent.match(tagRegex);
    const tags = tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];
    const res = {
      content: onlyContent,
      headers: headers,
      tags
    }
    return res;
  }

  const renderMd = (file) => {
    const path = file.path;
    const content = `${deps.fs.readFileSync(path)}`;
    const parsedContent = parseContent(content);
    const rendered = deps.marked(fixMdLinks(replaceRefs(replaceTags(replaceFootNotes(parsedContent.content)))));

    const properties = parsedContent.headers || {};
    if (properties.title)
      file.title = properties.title;
    else
      properties.title = file.title;
    file.content = rendered;
    file.properties = properties;
  }

  content
    .filter(file => file.type === consts.fileType.md)
    .forEach(file => renderMd(file))
}

module.exports = processMd;