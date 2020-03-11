const consts = require("../consts")

const cataloger = (files, lexer) => {
  const res = files
    .filter(res => res.type === consts.fileType.md)
    .map(file =>
      ({
        title: file.title,
        path: file.relativePath.replace(/\.md$/i, ".html"),
        lex: lexer(file.mdcontent)
      }))
    .reduce((catalog, elt) => {
      elt.lex.forEach((lexElement) => {
        if (lexElement === "constructor") {
          lexElement = "constructor "
        }
        if (!catalog[lexElement]) {
          catalog[lexElement] = []
        }
        catalog[lexElement].push({
          title: elt.title,
          path: elt.path
        });
      })
      return catalog
    }, {})
  return res;
}

module.exports = cataloger;