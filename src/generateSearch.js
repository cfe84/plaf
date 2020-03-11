const cataloger = require("./search/cataloger");
const lex = require("./search/lex")
const renderSearch = require("./search/renderSearch")

const generateSearch = (folderContent, outputFolder, deps) => {
  const catalog = cataloger(folderContent, lex);
  renderSearch(catalog, outputFolder, deps);
}

module.exports = generateSearch