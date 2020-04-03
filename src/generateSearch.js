const generateSearch = (outputDir, deps) => {
  const lunr = `${deps.fs.readFileSync(deps.path.join(__dirname, "lib", "lunr.js"))}`;
  const search = `${deps.fs.readFileSync(deps.path.join(__dirname, "loadSearch.js"))}`;

  const content = `${lunr}\n${search.substring(search.indexOf("\n"), search.lastIndexOf("\n"))}\nconst search = loadSearch(catalog);`

  deps.fs.writeFileSync(deps.path.join(outputDir, "search", "search.js"), content);
}

module.exports = generateSearch