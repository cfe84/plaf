const consts = require("./consts");
const generateIndex = (content, outputFolder, deps) => {

  const generateIndexForFolder = (folder) => {
    const targetFile = deps.path.join(outputFolder, folder.relativePath, "index.html");
    if (deps.fs.existsSync(targetFile)) {
      return;
    }
    const list = folder.files
      .sort((f1, f2) => f1.type === f2.type ? 0 : f1.type === consts.fileType.folder ? -1 : 1)
      .sort((f1, f2) => f1.name > f2.name ? -1 : 1)
      .map(item => {
        const path = item.type === consts.fileType.folder
          ? item.filename + "/index.html"
          : item.filename.replace(/\.md$/i, ".html");
        return `<li class="item-${item.type}"><a href="${path}">${item.title}</a></li>`;
      })
      .join("\n");
    const template = deps.getTemplate({});
    const indexContent = template({
      title: folder.title,
      content: `<ul class="post-list">${list}</ul>`
    });
    deps.fs.writeFileSync(targetFile, indexContent)
  }

  content
    .filter(f => f.type === consts.fileType.folder)
    .forEach(generateIndexForFolder);
}

module.exports = generateIndex