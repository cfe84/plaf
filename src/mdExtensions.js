const consts = require("../src/consts");

const processMd = ({ folderContent }) => {
  const tagRegex = /(^| )#([a-zA-Z0-9-_]+)/gm

  const replaceTags = (content) => {
    return content.replace(tagRegex, `$1<a href="/tags/$2.html">#$2</a>`);
  }

  const getTags = (onlyContent) => {
    const tagMatches = onlyContent.match(tagRegex);
    const tags = tagMatches ? tagMatches.map(tag => tag.trim().substring(1)) : [];
    return tags;
  }

  const replaceRefs = (content) => {
    const referenceRegex = /\s*\((\[ref\]\([^)]+\))\)/g
    return content
      .replace(referenceRegex, `<sup>$1</sup>`)
  }

  const replaceFootNotes = (content) => {
    const notesRegex = /(\s|^)\[\^(\d+)\]\s*:/g
    const referenceRegex = /(\S|\])\[\^(\d+)\]/gm
    return content
      .replace(notesRegex, `$1<a name="note-$2" href="#ref-$2">[$2]</a>:`)
      .replace(referenceRegex, `$1<sup><a name="ref-$2" href="#note-$2">[$2]</a></sup>`)
  }

  const replaceArrows = (content) => {
    const rarrRegex = /-->/g
    const larrRegex = /<--/g
    const rArrRegex = /==>/g
    const lArrRegex = /<==/g
    return content
      .replace(rarrRegex, "&rarr;")
      .replace(larrRegex, "&larr;")
      .replace(rArrRegex, "&rArr;")
      .replace(lArrRegex, "&lArr;")
  }

  const processMd = (file) => {
    file.properties.tags = getTags(file.content);
    file.content = replaceTags(replaceArrows(replaceRefs(replaceFootNotes(file.content))));
  }

  folderContent
    .filter(file => file.type === consts.fileType.md)
    .forEach(file => processMd(file))
}

module.exports = processMd;