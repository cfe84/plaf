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

  const replacements = [
    [/<->/g, "&harr;"],
    [/-->/g, "&rarr;"],
    [/<--/g, "&larr;"],
    [/<=>/g, "&hArr;"],
    [/==>/g, "&rArr;"],
    [/<==/g, "&lArr;"],
    [/---/g, "&mdash;"],
    [/--/g, "&ndash;"],
    [/<</g, "&laquo;"],
    [/>>/g, "&raquo;"],
  ]

  const replaceSpecialCharacters =
    replacements
      .map(replacement => (input) => input.replace(replacement[0], replacement[1]))
      .reduce((pipeline, step) => (input) => step(pipeline(input)))

  const processMd = (file) => {
    file.properties.tags = getTags(file.content);
    file.content = replaceTags(replaceRefs(replaceFootNotes(file.content)));
    if (file.properties["specialCharacters"] === undefined || file.properties["specialCharacters"]) {
      file.content = replaceSpecialCharacters(file.content)
    }
  }

  folderContent
    .filter(file => file.type === consts.fileType.md)
    .forEach(file => processMd(file))
}

module.exports = processMd;