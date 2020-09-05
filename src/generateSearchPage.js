const consts = require("./consts");
const generateSearchPage = ({ inputFolder, deps, folderContent }) => {
  const DEFAULT_INDEX = deps.path.join(__dirname, "search", "indexTemplate.md");
  const searchFileName = deps.path.join(inputFolder, "search", "index.md")
  if (folderContent.filter(folder => folder.type === consts.fileType.folder && folder.relativePath === "search").length === 0) {
    folderContent.push({
      type: consts.fileType.folder,
      relativePath: "search"
    })
  }
  if (!deps.fs.existsSync(searchFileName)) {
    const defaultIndex = `${deps.fs.readFileSync(DEFAULT_INDEX)}`
    folderContent.push({
      content: defaultIndex,
      type: "md",
      relativePath: deps.path.join("search", "index.md"),
      properties: {
        title: "Search"
      }
    })
  }
}

module.exports = generateSearchPage