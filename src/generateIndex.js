const consts = require("./consts");
const generateIndex = (content, outputFolder, deps) => {

  const generateIndexForFolder = ({ folder, targetFile }) => {
    const list = folder.files
      .filter(file => !file.hidden)
      .sort((f1, f2) => f1.type === f2.type ? 0 : f1.type === consts.fileType.folder ? -1 : 1)
      .sort((f1, f2) => f1.name > f2.name ? -1 : 1)
      .map(item => {
        const path = item.type === consts.fileType.folder
          ? item.filename + "/index.html"
          : item.filename.replace(/\.md$/i, ".html");
        return `<li class="item-${item.type}"><a href="${path}">${item.title}</a></li>`;
      })
      .join("\n");
    folder.content = `<ul class="post-list">${list}</ul>`
    const template = deps.getTemplate({});
    const indexContent = template(folder);
    deps.fs.writeFileSync(targetFile, indexContent)
  }

  content
    .map(folder => ({
      folder,
      targetFile: deps.path.join(outputFolder, folder.relativePath, "index.html")
    }))
    .filter(({ folder, targetFile }) => folder.type === consts.fileType.folder &&
      !deps.fs.existsSync(targetFile) &&
      !folder.skipIndexing)
    .forEach(generateIndexForFolder);
}

module.exports = generateIndex