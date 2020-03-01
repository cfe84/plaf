const consts = require("./consts");
const generateIndex = (content, outputFolder, name, deps) => {

  const generateIndexForFolder = (folder) => {
    const list = folder.content
      .sort((f1, f2) => f1.type === f2.type ? 0 : f1.type === consts.fileType.folder ? 1 : -1)
      .sort((f1, f2) => f1.name > f2.name ? -1 : 1)
      .map(item => {
        const path = item.type === consts.fileType.folder
          ? item.relativePath + "/index.html"
          : item.relativePath.replace(/\.md$/i, ".html");
        return `<li class="item-${item.type}"><a href="${path}">${item.title}</a></li>`;
      })
      .join("\n");
    const template = deps.getTemplate({});
    const indexContent = template({
      title: folder.title,
      content: `<ul class="post-list">${list}</ul>`
    });
    deps.fs.writeFileSync(deps.path.join(outputFolder, folder.relativePath, "index.html"), indexContent)
  }

  content
    .filter(f => f.type === consts.fileType.folder)
    .concat([{
      title: name,
      relativePath: "",
      content: content.filter(file => file.relativePath.indexOf("/") < 0)
    }])
    .forEach(generateIndexForFolder);
}

module.exports = generateIndex