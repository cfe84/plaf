const lunr = require("./lib/lunr")

const loadSearch = (catalog) => {
  const index = lunr(function () {
    this.field("title", { boost: 5 });
    this.field("tags", { boost: 2 });
    this.field("mdcontent", { boost: 1 });

    catalog.forEach((entry, idx) => {
      entry.id = idx
      this.add(entry)
    })
  });
  return (searchTerm) => {
    const results = index.search(searchTerm);
    return results.map(res => catalog[res.ref])
  }
}

module.exports = loadSearch;