const consts = require("../src/consts");
const processMd = ({ folderContent }) => {
  const resolveArticleName = (name) => {
    const cleanName = (name) => name
      .toLowerCase()
      .replace(/[_ -]/g, "")
      .replace(/\.md$/, "")
    const cleanedName = cleanName(name)
    return folderContent.find((file) => file.type === consts.fileType.md
      && cleanName(file.filename) === cleanedName)
  }

  const convertWikiLinkToHref = (originalMatch, nameMatch, labelMatch) => {
    const file = resolveArticleName(nameMatch)
    if (file === undefined) {
      return originalMatch
    }
    const link = file.relativePath.replace(/\.md$/i, ".html")
    const label = labelMatch || file.title
    return `<a href="/${link}">${label}</a>`
  }

  const replaceWikiLinks = (content) => {
    const regex = new RegExp('\\[\\[([^|\\]]+)(?:\\|([^\\]]+))?\\]\\]', "g")
    return content.replace(regex, (...match) => convertWikiLinkToHref(match[0], match[1], match[2]))
  }

  const processWikiLinks = file => {
    file.content = replaceWikiLinks(file.content);
  }

  folderContent
    .filter(file => file.type === consts.fileType.md)
    .forEach(file => processWikiLinks(file))
}

module.exports = processMd