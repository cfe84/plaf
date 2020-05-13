const consts = require("../src/consts");

const processMd = ({ folderContent, deps }) => {

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

  const processMd = (file) => {
    file.content = replaceRefs(replaceFootNotes(file.content));
  }

  folderContent
    .filter(file => file.type === consts.fileType.md)
    .forEach(file => processMd(file))
}

module.exports = processMd;