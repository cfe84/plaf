const handlebars = require("handlebars")
// required to prevent injection on handlebars
const fs = require("fs")
const path = require("path")

const template = fs.readFileSync(path.join(__dirname, "searchAndCatalog.handlebars")).toString();
const compiledTemplate = handlebars.compile(template)

const renderSearch = (catalog, outputFolder, deps) => {
  const outputFile = deps.path.join(outputFolder, "search.js");
  let createSearch = `${deps.fs.readFileSync(deps.path.join(__dirname, "createSearch.js"))}`
  const split = createSearch.split("\n");
  createSearch = split.slice(0, split.length - 1).join('\n');
  const result = compiledTemplate({
    createSearch,
    catalog: JSON.stringify(catalog, null, 2)
  })
  deps.fs.writeFileSync(outputFile, result)
}

module.exports = renderSearch